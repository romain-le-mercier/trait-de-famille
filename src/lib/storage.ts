import { createStore, del, get, keys, set } from "idb-keyval";

/**
 * Les images vivent dans IndexedDB (des Blob, potentiellement lourds), les
 * métadonnées dans le store Zustand persisté en localStorage.
 *
 * Un seul jeu de clés pour les dessins : `art:hd:<id>` et `art:thumb:<id>`.
 * Un essai gratuit et un coloriage payé sont le *même* fichier — seule la
 * vignette change (filigranée tant que ce n'est pas débloqué) et un drapeau
 * dans le store. C'est ce qui permet de payer après coup sans rappeler le
 * modèle, qui ne redonne jamais deux fois la même image.
 */
const store = createStore("trait-de-famille", "images");

const draftPhotoKey = "draft:photo";
const hdKey = (id: string) => `art:hd:${id}`;
const thumbKey = (id: string) => `art:thumb:${id}`;

export function saveDraftPhoto(blob: Blob) {
  return set(draftPhotoKey, blob, store);
}

export function getDraftPhoto(): Promise<Blob | undefined> {
  return get<Blob>(draftPhotoKey, store);
}

/**
 * Changement de photo. Les dessins déjà produits, eux, restent : ce sont les
 * essais que l'utilisateur retrouve dans sa galerie.
 */
export async function clearDraft() {
  await del(draftPhotoKey, store);
  await purgeLegacy();
}

/**
 * Reliquats des versions précédentes : le brouillon « maître » et le cache de
 * générations, tous deux remplacés par les clés `art:*`. Sans ce ménage, ils
 * occuperaient le quota du navigateur sans que rien ne les lise jamais.
 */
async function purgeLegacy() {
  const all = await keys(store);
  await Promise.all(
    all
      .filter(
        (key) =>
          typeof key === "string" &&
          (key === "draft:master" || key.startsWith("gen:")),
      )
      .map((key) => del(key as string, store)),
  );
}

/* ---------------------------------------------------------------- dessins */

export async function saveArtwork(id: string, hd: Blob, thumb: Blob) {
  await set(hdKey(id), hd, store);
  await set(thumbKey(id), thumb, store);
}

/** Remplace la vignette sans toucher au fichier : au déblocage, elle perd son filigrane. */
export function saveThumb(id: string, thumb: Blob) {
  return set(thumbKey(id), thumb, store);
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
