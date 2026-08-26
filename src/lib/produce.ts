import { applyWatermark, canvasToBlob, createCanvas, loadBitmap } from "./image";

export interface Artwork {
  /** Le fichier livré : exactement l'image générée, sans retouche. */
  hd: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

/**
 * Prépare un dessin déjà généré pour la galerie et la livraison.
 *
 * Rien n'est régénéré ici : on empaquette l'image que l'utilisateur a validée
 * dans l'aperçu, et on en tire une vignette légère.
 *
 * `watermark` sert aux essais non débloqués : la vignette de la galerie porte
 * alors le même filigrane que l'aperçu. Le fichier `hd`, lui, n'est jamais
 * altéré — c'est le déblocage qui donne le droit d'y accéder, et remplacer la
 * vignette suffit à le refléter.
 */
export async function packageArtwork(
  master: Blob,
  options: { watermark?: boolean } = {},
): Promise<Artwork> {
  const bitmap = await loadBitmap(master);
  const thumbCanvas = makeThumb(bitmap, 560);
  if (options.watermark) applyWatermark(thumbCanvas);
  const thumb = await canvasToBlob(thumbCanvas, "image/webp", 0.85);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close?.();

  return { hd: master, thumb, width, height };
}

function makeThumb(source: ImageBitmap, maxSide: number) {
  const ratio = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = createCanvas(
    Math.max(1, Math.round(source.width * ratio)),
    Math.max(1, Math.round(source.height * ratio)),
  );
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}
