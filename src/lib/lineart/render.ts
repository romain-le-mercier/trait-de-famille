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
  /** L'aperçu filigrané. L'original ne quitte pas le serveur avant paiement. */
  blob: Blob;
  width: number;
  height: number;
  /** Référence de l'original côté serveur, à présenter pour le débloquer. */
  oeuvreId: string;
}

export interface RenderRequest {
  photo: Blob;
  settings: LineArtSettings;
  /** Repris tel quel dans l'enregistrement : sert à retrouver ses dessins. */
  fileName?: string;
  /** Empreinte de la photo, pour la détection de doublon. */
  photoKey?: string;
  onProgress?: ProgressFn;
}

/**
 * Génère le dessin à partir de la photo.
 *
 * Un seul appel au modèle, deux sorties : l'original est rangé sur le serveur,
 * le navigateur ne reçoit que l'aperçu filigrané. C'est ce qui fait du
 * paiement une vraie barrière — tant que le fichier propre arrivait ici, le
 * filigrane n'était qu'une convention d'affichage.
 *
 * On ne régénère jamais après paiement : on livre exactement l'image validée
 * dans l'aperçu, puisque le modèle en produirait une différente.
 */
export async function renderLineArt({
  photo,
  settings,
  fileName,
  photoKey,
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
  if (fileName) form.append("fileName", fileName);
  if (photoKey) form.append("photoKey", photoKey);

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

  const oeuvreId = response.headers.get("X-Oeuvre") ?? "";
  if (!oeuvreId) {
    // Sans cette référence, l'aperçu ne pourrait jamais être débloqué : mieux
    // vaut le dire tout de suite que de laisser l'utilisateur payer pour rien.
    throw new Error("Le dessin n'a pas pu être enregistré. Réessaie.");
  }

  const blob = await response.blob();
  const result = await loadBitmap(blob);
  const width = result.width;
  const height = result.height;
  result.close?.();
  onProgress?.(1);

  return { blob, width, height, oeuvreId };
}
