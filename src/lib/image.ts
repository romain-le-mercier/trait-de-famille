import type { CropRect } from "./lineart/types";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface FileCheck {
  ok: boolean;
  message?: string;
}

/** Validation côté client, avec les messages du brief (pas d'excuses). */
export function checkImageFile(file: File): FileCheck {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: "Ce format ne passe pas. Essaie une photo JPG, PNG ou WebP.",
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: `Cette photo pèse ${formatBytes(file.size)}. Il faut rester sous 10 Mo.`,
    };
  }
  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Empreinte du contenu d'une photo.
 *
 * Deux dépôts du même fichier donnent la même clé : c'est ce qui permet de
 * retrouver un coloriage déjà produit au lieu de rappeler le modèle. La
 * comparaison est exacte, à l'octet près — une photo réenregistrée ou
 * recompressée est une photo différente, et c'est voulu : mieux vaut
 * redessiner que servir le coloriage d'une autre image.
 *
 * `crypto.subtle` n'existe qu'en contexte sécurisé (HTTPS ou localhost). En
 * son absence on renvoie une clé unique : la déduplication ne joue pas, mais
 * rien ne casse.
 */
export async function photoFingerprint(blob: Blob): Promise<string> {
  if (!globalThis.crypto?.subtle) return `sans-empreinte-${Date.now()}`;
  try {
    const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  } catch {
    return `sans-empreinte-${Date.now()}`;
  }
}

/** Décode un fichier image en respectant l'orientation EXIF. */
export async function loadBitmap(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    // Safari anciens : repli sans option d'orientation.
    return await createImageBitmap(blob);
  }
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };

/**
 * Dessine la source (éventuellement recadrée) dans un canvas dont le grand
 * côté ne dépasse pas `maxSide`.
 */
export function drawSource(
  bitmap: ImageBitmap,
  maxSide: number,
  crop: CropRect = FULL_CROP,
): HTMLCanvasElement {
  const sx = Math.round(crop.x * bitmap.width);
  const sy = Math.round(crop.y * bitmap.height);
  const sw = Math.max(1, Math.round(crop.width * bitmap.width));
  const sh = Math.max(1, Math.round(crop.height * bitmap.height));

  const ratio = Math.min(1, maxSide / Math.max(sw, sh));
  const dw = Math.max(1, Math.round(sw * ratio));
  const dh = Math.max(1, Math.round(sh * ratio));

  const canvas = createCanvas(dw, dh);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dw, dh);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, dw, dh);
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export impossible"))),
      type,
      quality,
    );
  });
}

/** Filigrane diagonal discret, appliqué uniquement à l'aperçu gratuit. */
export function applyWatermark(canvas: HTMLCanvasElement, text = "APERÇU") {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const diag = Math.hypot(width, height);
  const size = Math.max(14, Math.round(diag * 0.035));

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = `700 ${size}px ${"system-ui, sans-serif"}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(123, 97, 255, 0.20)";

  const label = `${text} · TRAIT DE FAMILLE · `;
  const stepY = size * 3;
  const rows = Math.ceil(diag / stepY);
  for (let r = -rows; r <= rows; r++) {
    ctx.fillText(label.repeat(3), 0, r * stepY);
  }
  ctx.restore();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function slugDate(date = new Date()): string {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
