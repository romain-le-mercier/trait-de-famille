import {
  canvasToBlob,
  drawSource,
  FULL_CROP,
  loadBitmap,
} from "../image";
import {
  INPUT_MAX_SIDE,
  type LineArtSettings,
  type ProgressFn,
} from "./types";

export interface RenderResult {
  /** L'image générée, telle que renvoyée par le modèle. */
  blob: Blob;
  width: number;
  height: number;
}

export interface RenderRequest {
  photo: Blob;
  settings: LineArtSettings;
  onProgress?: ProgressFn;
}

/**
 * Génère le dessin à partir de la photo.
 *
 * Un seul appel, un seul résultat : c'est cette image-là qui sert d'aperçu
 * *et* de fichier livré. Regénérer produirait une image différente — donc on
 * ne régénère jamais après paiement, on livre exactement ce qui a été validé.
 */
export async function renderLineArt({
  photo,
  settings,
  onProgress,
}: RenderRequest): Promise<RenderResult> {
  onProgress?.(0.06);

  const bitmap = await loadBitmap(photo);
  const source = drawSource(bitmap, INPUT_MAX_SIDE, settings.crop ?? FULL_CROP);
  bitmap.close?.();

  const input = await canvasToBlob(source, "image/jpeg", 0.92);
  onProgress?.(0.14);

  const form = new FormData();
  form.append("photo", input, "photo.jpg");
  form.append("detail", settings.detail);
  form.append("stroke", settings.stroke);
  form.append("removeBackground", settings.removeBackground ? "1" : "0");

  const response = await fetch("/api/generate", { method: "POST", body: form });
  onProgress?.(0.75);

  if (!response.ok) {
    // Nos propres erreurs sont toujours du JSON avec un `message`. Si le corps
    // n'en est pas, la réponse ne vient pas de l'app mais de ce qui est devant
    // (proxy, passerelle) : on garde le code HTTP, sinon la panne est
    // indiagnosticable depuis le navigateur.
    const detail = await response.json().catch(() => null);
    if (detail?.message) throw new Error(detail.message);
    throw new Error(
      response.status === 504 || response.status === 524
        ? `Le dessin a mis trop de temps à revenir (erreur ${response.status}). Réessaie.`
        : `La génération a échoué (erreur ${response.status}).`,
    );
  }

  const blob = await response.blob();
  const result = await loadBitmap(blob);
  const width = result.width;
  const height = result.height;
  result.close?.();
  onProgress?.(1);

  return { blob, width, height };
}
