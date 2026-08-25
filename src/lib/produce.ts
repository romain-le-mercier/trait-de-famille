import { canvasToBlob, createCanvas, loadBitmap } from "./image";

export interface Artwork {
  /** Le fichier livré : exactement l'image générée, sans retouche. */
  hd: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

/**
 * Prépare le coloriage déjà généré pour la livraison et la galerie.
 *
 * Rien n'est régénéré ici : on empaquette l'image que l'utilisateur a validée
 * dans l'aperçu, et on en tire une vignette légère pour la galerie.
 */
export async function packageArtwork(master: Blob): Promise<Artwork> {
  const bitmap = await loadBitmap(master);
  const thumbCanvas = makeThumb(bitmap, 560);
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
