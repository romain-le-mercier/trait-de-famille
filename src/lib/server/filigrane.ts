import sharp from "sharp";

/**
 * L'aperçu filigrané, produit côté serveur.
 *
 * C'est le pivot du paywall : le navigateur ne reçoit plus que cette image, et
 * l'original ne quitte le serveur qu'après paiement. Tant que le filigrane
 * était posé par le navigateur, il ne protégeait rien — le fichier propre
 * était déjà là.
 *
 * L'aperçu est aussi volontairement réduit : il s'affiche sur moins de 800 px
 * de large, et servir neuf mégapixels pour ça coûterait du temps de
 * chargement à chaque essai. Le fichier livrable, lui, reste intact.
 */

/** Grand côté de l'aperçu. */
const APERCU_MAX = 1400;

const MOT = "APERÇU · TRAIT DE FAMILLE";

/**
 * Le filigrane est un SVG composité par sharp plutôt qu'un dessin pixel par
 * pixel : il reste net quelle que soit la taille, et le motif se décrit en
 * quelques lignes.
 */
function motif(largeur: number, hauteur: number): Buffer {
  const diagonale = Math.hypot(largeur, hauteur);
  const taille = Math.max(14, Math.round(diagonale * 0.035));
  const pas = taille * 3;
  const lignes = Math.ceil(diagonale / pas);

  const textes: string[] = [];
  for (let i = -lignes; i <= lignes; i += 1) {
    textes.push(
      `<text x="0" y="${i * pas}" text-anchor="middle" ` +
        `font-family="system-ui, sans-serif" font-weight="700" ` +
        `font-size="${taille}" fill="#7b61ff" fill-opacity="0.20">` +
        `${escaper(`${MOT} · `.repeat(3))}</text>`,
    );
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}">` +
      `<g transform="translate(${largeur / 2} ${hauteur / 2}) rotate(-30)">` +
      textes.join("") +
      `</g></svg>`,
  );
}

/** Le texte entre dans du XML : sans ça, un jour, il le casserait. */
function escaper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface Apercu {
  data: Buffer;
  mimeType: string;
}

export async function construireApercu(original: Buffer): Promise<Apercu> {
  const meta = await sharp(original).metadata();
  const cote = Math.max(meta.width ?? 0, meta.height ?? 0);
  if (!meta.width || !meta.height || !cote) {
    throw new Error("Image illisible : dimensions inconnues.");
  }

  const facteur = Math.min(1, APERCU_MAX / cote);
  const largeur = Math.round(meta.width * facteur);
  const hauteur = Math.round(meta.height * facteur);

  const data = await sharp(original)
    .resize(largeur, hauteur, { kernel: "lanczos3" })
    // Le trait est noir sur blanc ; le filigrane est violet. L'aperçu doit
    // donc être en couleurs, contrairement au livrable.
    .toColourspace("srgb")
    .composite([{ input: motif(largeur, hauteur), top: 0, left: 0 }])
    .webp({ quality: 88 })
    .toBuffer();

  return { data, mimeType: "image/webp" };
}
