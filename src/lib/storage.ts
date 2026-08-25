import { createStore, del, get, keys, set } from "idb-keyval";

/**
 * Les images vivent dans IndexedDB (des Blob, potentiellement lourds), les
 * métadonnées dans le store Zustand persisté en localStorage.
 */
const store = createStore("trait-de-famille", "images");

const draftPhotoKey = "draft:photo";
/** Le dessin généré pour le brouillon en cours : c'est le fichier qui sera
 *  livré. Il survit à l'aller-retour vers Stripe, donc rien à régénérer
 *  après paiement. */
const draftMasterKey = "draft:master";
const hdKey = (id: string) => `art:hd:${id}`;
const thumbKey = (id: string) => `art:thumb:${id}`;

export function saveDraftPhoto(blob: Blob) {
  return set(draftPhotoKey, blob, store);
}

export function getDraftPhoto(): Promise<Blob | undefined> {
  return get<Blob>(draftPhotoKey, store);
}

export function saveDraftMaster(blob: Blob) {
  return set(draftMasterKey, blob, store);
}

export function getDraftMaster(): Promise<Blob | undefined> {
  return get<Blob>(draftMasterKey, store);
}

export function clearDraftMaster() {
  return del(draftMasterKey, store);
}

/* ------------------------------------------------------------------ cache */

/**
 * Cache des générations, indexé par signature de réglages.
 *
 * Chaque appel au modèle coûte et prend plusieurs secondes : revenir sur une
 * combinaison déjà essayée (Enfant → Ado → Enfant) doit être instantané et
 * gratuit.
 */
const genKey = (draftId: string, signature: string) =>
  `gen:${draftId}:${signature}`;

export function saveGeneration(draftId: string, signature: string, blob: Blob) {
  return set(genKey(draftId, signature), blob, store);
}

export function getGeneration(
  draftId: string,
  signature: string,
): Promise<Blob | undefined> {
  return get<Blob>(genKey(draftId, signature), store);
}

/** Signatures déjà générées pour ce brouillon (pour l'affichage des variantes). */
export async function listGenerations(draftId: string): Promise<string[]> {
  const prefix = `gen:${draftId}:`;
  const all = await keys(store);
  return all
    .filter((key): key is string => typeof key === "string" && key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
}

/** Purge le cache d'un brouillon : appelé quand on change de photo. */
export async function clearGenerations(draftId?: string) {
  const prefix = draftId ? `gen:${draftId}:` : "gen:";
  const all = await keys(store);
  await Promise.all(
    all
      .filter((key) => typeof key === "string" && key.startsWith(prefix))
      .map((key) => del(key as string, store)),
  );
}

export async function clearDraft() {
  await del(draftPhotoKey, store);
  await del(draftMasterKey, store);
  await clearGenerations();
}

export async function saveArtwork(id: string, hd: Blob, thumb: Blob) {
  await set(hdKey(id), hd, store);
  await set(thumbKey(id), thumb, store);
}

export function getArtworkHd(id: string): Promise<Blob | undefined> {
  return get<Blob>(hdKey(id), store);
}

export function getArtworkThumb(id: string): Promise<Blob | undefined> {
  return get<Blob>(thumbKey(id), store);
}

export async function deleteArtwork(id: string) {
  await del(hdKey(id), store);
  await del(thumbKey(id), store);
}
