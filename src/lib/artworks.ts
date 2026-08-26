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
  draftId: string;
  fileName: string;
  settings: LineArtSettings;
  master: Blob;
}): Promise<string | null> {
  const { draftId, fileName, settings, master } = params;
  const id = makeId();

  const artwork = await packageArtwork(master, { watermark: true });
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
  const previous = findTest(draftId, settings);
  if (previous && !previous.unlocked) await forget(previous.id);

  useAppStore.getState().upsertItem({
    id,
    draftId,
    fileName,
    settings,
    createdAt: Date.now(),
    unlocked: false,
  });

  await evictOldTests();
  return id;
}

/**
 * Le dessin déjà produit pour ces réglages, s'il existe encore. C'est ce qui
 * rend gratuit et instantané le retour sur une combinaison déjà essayée.
 */
export function findTest(
  draftId: string,
  settings: LineArtSettings,
): GalleryItem | undefined {
  const key = settingsKey(settings);
  return useAppStore
    .getState()
    .items.find(
      (item) => item.draftId === draftId && settingsKey(item.settings) === key,
    );
}

/** Les combinaisons de réglages déjà dessinées pour cette photo. */
export function testedKeys(items: GalleryItem[], draftId: string): Set<string> {
  return new Set(
    items
      .filter((item) => item.draftId === draftId)
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
 * L'ordre compte : le fichier est préparé **avant** le débit, et le crédit est
 * rendu si l'enregistrement échoue ensuite. Personne ne doit payer pour un
 * fichier qu'il n'a pas reçu.
 */
export async function unlockArtwork(id: string): Promise<UnlockOutcome> {
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
