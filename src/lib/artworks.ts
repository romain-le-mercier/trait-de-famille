import { suivre } from "./analytics";
import { settingsKey, type LineArtSettings } from "./lineart/types";
import { packageArtwork } from "./produce";
import { makeId, useAppStore, type GalleryItem } from "./store";
import { deleteArtwork, getArtworkHd, saveArtwork, saveThumb } from "./storage";

/**
 * Cycle de vie d'un dessin, de l'essai gratuit au fichier payé.
 *
 * Un essai généré est conservé tel quel : le déblocage ultérieur ne rappelle
 * pas le modèle, il livre l'image exacte que l'utilisateur avait validée.
 * Sans ça, payer pour un aperçu qu'on a aimé donnerait un autre dessin.
 */

/**
 * Nombre d'essais non débloqués conservés. Le quota d'IndexedDB n'est pas
 * infini, et une image de coloriage pèse près d'un mégaoctet : sans plafond,
 * un utilisateur curieux finirait par ne plus rien pouvoir enregistrer — y
 * compris ce qu'il vient de payer. Les coloriages débloqués ne sont jamais
 * évincés.
 */
const MAX_TESTS = 24;

/**
 * Enregistre un dessin qui vient d'être généré et l'ajoute à la galerie,
 * verrouillé. Renvoie son identifiant, ou `null` si le navigateur a refusé
 * de le stocker — l'aperçu reste alors affichable, il n'est simplement pas
 * gardé.
 */
export async function saveTest(params: {
  photoKey: string;
  fileName: string;
  settings: LineArtSettings;
  /** L'aperçu filigrané renvoyé par le serveur. L'original y reste. */
  master: Blob;
  /** Référence de l'original, à présenter pour le débloquer. */
  oeuvreId?: string;
}): Promise<string | null> {
  const { photoKey, fileName, settings, master, oeuvreId } = params;
  const id = makeId();

  // Le filigrane est désormais posé par le serveur : le remettre ici le
  // dessinerait deux fois.
  const artwork = await packageArtwork(master, { watermark: !oeuvreId });
  try {
    await saveArtwork(id, master, artwork.thumb);
  } catch (error) {
    // Quota dépassé, mode privé restrictif… : on ne casse pas la génération
    // en cours pour autant.
    console.warn("[galerie] dessin non conservé", error);
    return null;
  }

  // Regénérer les mêmes réglages remplace l'essai précédent — mais jamais un
  // coloriage payé : ce fichier-là ne nous appartient plus.
  const previous = findTest(photoKey, settings);
  if (previous && !previous.unlocked) await forget(previous.id);

  useAppStore.getState().upsertItem({
    id,
    photoKey,
    fileName,
    settings,
    createdAt: Date.now(),
    unlocked: false,
    oeuvreId,
  });

  await evictOldTests();
  return id;
}

/**
 * Le dessin déjà produit pour cette photo et ces réglages, s'il existe encore.
 *
 * C'est ce qui rend gratuit et instantané le retour sur une combinaison déjà
 * essayée — et, la clé étant l'empreinte du fichier, le redépôt d'une photo
 * déjà transformée.
 */
export function findTest(
  photoKey: string,
  settings: LineArtSettings,
): GalleryItem | undefined {
  const key = settingsKey(settings);
  return useAppStore
    .getState()
    .items.find(
      (item) => item.photoKey === photoKey && settingsKey(item.settings) === key,
    );
}

/** Les combinaisons de réglages déjà dessinées pour cette photo. */
export function testedKeys(items: GalleryItem[], photoKey: string): Set<string> {
  return new Set(
    items
      .filter((item) => item.photoKey === photoKey)
      .map((item) => settingsKey(item.settings)),
  );
}

/** Supprime un dessin, images comprises. */
export async function forget(id: string) {
  await deleteArtwork(id);
  useAppStore.getState().removeItem(id);
}

async function evictOldTests() {
  const surplus = useAppStore
    .getState()
    .items.filter((item) => !item.unlocked)
    .slice(MAX_TESTS);
  for (const item of surplus) await forget(item.id);
}

export type UnlockOutcome =
  | { ok: true; credits: number }
  | { ok: false; reason: "auth" | "credits" | "missing" | "error"; message?: string };

/**
 * Dépense un crédit et transforme un essai en coloriage livrable.
 *
 * Deux chemins, selon l'âge du dessin. Les nouveaux vivent sur le serveur :
 * c'est lui qui débite et qui livre, en une seule requête, et l'original
 * n'était jamais arrivé ici avant. Les anciens ont leur fichier en local et
 * gardent l'ancien chemin — on avait promis de pouvoir payer plus tard sans
 * redessiner, et ce n'est pas un déploiement qui va reprendre la promesse.
 */
export async function unlockArtwork(id: string): Promise<UnlockOutcome> {
  const item = useAppStore.getState().items.find((i) => i.id === id);
  if (item?.oeuvreId) return debloquerSurServeur(id, item.oeuvreId);
  return debloquerEnLocal(id);
}

/**
 * Chemin serveur : l'original n'a jamais quitté le volume.
 *
 * Tout l'ordre des opérations vit désormais dans la route — fichier lu avant
 * le débit, réclamation atomique qui décide qui paie. Ici il ne reste qu'à
 * ranger ce qu'elle renvoie.
 */
async function debloquerSurServeur(
  id: string,
  oeuvreId: string,
): Promise<UnlockOutcome> {
  let response: Response;
  try {
    response = await fetch(`/api/oeuvres/${oeuvreId}/debloquer`, { method: "POST" });
  } catch {
    return { ok: false, reason: "error", message: "Le serveur est injoignable." };
  }

  if (response.status === 401) return { ok: false, reason: "auth" };
  if (response.status === 402) return { ok: false, reason: "credits" };
  if (response.status === 404 || response.status === 410) {
    return { ok: false, reason: "missing" };
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    return { ok: false, reason: "error", message: detail?.message };
  }

  // Le crédit est dépensé quoi qu'il arrive ensuite : le solde affiché doit le
  // refléter, même si la suite échoue.
  await useAppStore.getState().refreshAccount();

  try {
    const original = await response.blob();
    const artwork = await packageArtwork(original);
    // L'aperçu filigrané cède la place à l'original : c'est lui qu'on livre,
    // et c'est lui qui doit rester si le compte change d'appareil.
    await saveArtwork(id, original, artwork.thumb);
  } catch (error) {
    /**
     * Ne pas marquer débloqué ici, et le dire.
     *
     * Sous cette clé, IndexedDB contient encore l'**aperçu filigrané** : c'est
     * lui que `saveTest` y avait rangé. Marquer quand même reviendrait à faire
     * disparaître le bouton « Débloquer » et à laisser le bouton « PDF »
     * fabriquer un PDF filigrané en 1400 px à quelqu'un qui vient de payer.
     * L'essai reste donc verrouillé côté navigateur, et la route étant
     * idempotente, réessayer ne reprendra pas un second crédit.
     */
    console.error("[galerie] original non conservé en local", error);
    return {
      ok: false,
      reason: "error",
      message:
        "Ton coloriage est débloqué, mais ce navigateur n'a pas pu le garder — " +
        "sa mémoire est sans doute pleine. Réessaie : aucun crédit ne sera repris.",
    };
  }

  useAppStore.getState().markUnlocked(id);
  // Un seul point de passage pour le déblocage : l'événement ne peut pas
  // dériver des deux chemins qui y mènent (aperçu, ou retour de paiement).
  suivre("coloriage-debloque");
  return { ok: true, credits: useAppStore.getState().account.credits };
}

/**
 * Récupère l'original d'un coloriage déjà payé, quand la copie locale a
 * disparu — navigateur nettoyé, quota dépassé, autre appareil.
 *
 * La route de déblocage est idempotente : une œuvre déjà payée est reservie
 * sans second débit. C'est ce qui permet de rattraper une galerie vidée au
 * lieu de laisser un client payé devant un bouton qui ne fait rien.
 */
export async function reprendreOriginal(id: string): Promise<Blob | null> {
  const item = useAppStore.getState().items.find((i) => i.id === id);
  // Reprendre, jamais acheter : sans la condition sur `unlocked`, un appel sur
  // un essai non payé débiterait un crédit sans que rien ne l'annonce.
  if (!item?.oeuvreId || !item.unlocked) return null;

  let response: Response;
  try {
    response = await fetch(`/api/oeuvres/${item.oeuvreId}/debloquer`, { method: "POST" });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const original = await response.blob();
  try {
    const artwork = await packageArtwork(original);
    await saveArtwork(id, original, artwork.thumb);
  } catch (error) {
    // Le fichier est là, seule sa conservation a échoué : on le livre quand
    // même, quitte à le redemander la prochaine fois.
    console.warn("[galerie] original repris mais non conservé", error);
  }
  return original;
}

/**
 * Ancien chemin, pour les dessins produits avant que les originaux ne quittent
 * le navigateur.
 *
 * L'ordre compte : le fichier est préparé **avant** le débit, et le crédit est
 * rendu si l'enregistrement échoue ensuite. Personne ne doit payer pour un
 * fichier qu'il n'a pas reçu.
 */
async function debloquerEnLocal(id: string): Promise<UnlockOutcome> {
  const master = await getArtworkHd(id);
  if (!master) return { ok: false, reason: "missing" };

  let consumed = false;
  try {
    const artwork = await packageArtwork(master);

    const response = await fetch("/api/credits/consume", { method: "POST" });
    if (response.status === 401) return { ok: false, reason: "auth" };
    if (response.status === 402) return { ok: false, reason: "credits" };
    if (!response.ok) throw new Error("Le débit du crédit a échoué.");
    consumed = true;

    const data = await response.json();
    const credits = Number(data.credits ?? 0);

    // Le fichier est déjà là : seule la vignette perd son filigrane.
    await saveThumb(id, artwork.thumb);
    useAppStore.getState().setCredits(credits);
    useAppStore.getState().markUnlocked(id);
    // Un seul point de passage pour le déblocage : l'événement ne peut pas
    // dériver des deux chemins qui y mènent (aperçu, ou retour de paiement).
    suivre("coloriage-debloque");
    return { ok: true, credits };
  } catch (error) {
    if (consumed) {
      await fetch("/api/credits/consume", { method: "DELETE" }).catch(() => {});
      await useAppStore.getState().refreshAccount();
    }
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : undefined,
    };
  }
}
