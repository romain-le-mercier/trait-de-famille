import sharp from "sharp";

/**
 * Met une image du modèle en état d'être imprimée.
 *
 * Le produit fini n'est pas un fichier, c'est une feuille A4 sortie d'une
 * imprimante familiale. Or le modèle renvoie du JPEG d'environ 864×1248 :
 * deux défauts s'y cumulent, et aucun ne se voit à l'écran.
 *
 * **La définition.** Une fois posée dans la zone imprimable de l'A4, cette
 * image tombe à 118 ppp là où il en faudrait 300. Les bords sortent en
 * escalier.
 *
 * **Le JPEG.** C'est le pire format possible pour du trait noir sur blanc :
 * la compression entoure chaque ligne d'un halo gris. Ce halo est cuit dans
 * les octets dès la réponse du modèle — d'où le traitement ici, au plus près
 * de la source, et jamais côté navigateur où il serait déjà trop tard.
 *
 * La chaîne a été choisie en comparant cinq variantes sur de vrais dessins :
 *
 *   - **agrandir d'abord, nettoyer ensuite.** L'inverse crénelle les courbes ;
 *     lanczos travaille mieux sur les dégradés du JPEG que sur un trait déjà
 *     binarisé ;
 *   - **étirer le contraste plutôt que seuiller.** Le seuillage franc donne
 *     un fichier quatre fois plus léger, mais il ronge le trait — exactement
 *     ce qu'on ne veut pas sur des dessins destinés à des mains de trois ans,
 *     où le prompt réclame un trait épais. L'étirement ramène le blanc à
 *     blanc et le noir à noir en gardant l'anticrénelage du bord ;
 *   - **PNG en palette, sans tramage.** Seize niveaux de gris suffisent
 *     largement pour de l'anticrénelage de bord, et le fichier pèse trois
 *     fois moins qu'un PNG pleine profondeur. Le tramage est coupé : il
 *     réintroduirait précisément la trame que le prompt interdit.
 *
 * Mesuré sur deux dessins publiés : le gris parasite passe de 2,3 % à 1,3 %
 * des pixels, pour 158 Ko en 2429×3508 contre 225 Ko en 864×1248.
 */

/** Hauteur d'une A4 à 300 ppp. On y cale le grand côté du dessin. */
const GRAND_COTE = 3508;

/**
 * Étirement du contraste : `v' = 2,2 v − 140`. Tout ce qui est sous 64
 * devient noir, tout ce qui dépasse 178 devient blanc, et le bord garde sa
 * pente. Vérifié sur les traits les plus fins de la bibliothèque — les
 * moustaches du chat — qui ressortent intacts.
 */
const PENTE = 2.2;
const ORIGINE = -140;

export interface ImageFinie {
  data: Buffer;
  mimeType: string;
  largeur: number;
  hauteur: number;
}

export async function preparerPourImpression(entree: Buffer): Promise<ImageFinie> {
  const meta = await sharp(entree).metadata();
  const cote = Math.max(meta.width ?? 0, meta.height ?? 0);
  if (!meta.width || !meta.height || !cote) {
    throw new Error("Image illisible : dimensions inconnues.");
  }

  // On ne réduit jamais : si le modèle renvoie mieux un jour, on le garde.
  const facteur = Math.max(1, GRAND_COTE / cote);
  const largeur = Math.round(meta.width * facteur);
  const hauteur = Math.round(meta.height * facteur);

  const data = await sharp(entree)
    .resize(largeur, hauteur, { kernel: "lanczos3" })
    .greyscale()
    .linear(PENTE, ORIGINE)
    .png({ compressionLevel: 9, palette: true, colours: 16, dither: 0 })
    .toBuffer();

  return { data, mimeType: "image/png", largeur, hauteur };
}
