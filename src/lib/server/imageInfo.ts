/**
 * Dimensions d'une image, lues dans son en-tête.
 *
 * Le serveur n'a pas de canvas et on ne va pas ajouter une dépendance de
 * traitement d'image pour deux entiers. Ils servent à réserver la place du
 * dessin dans la page : sans eux, la mise en page saute au chargement, ce que
 * Google mesure (CLS) sur des pages dont l'image est justement le contenu.
 */

export interface Dimensions {
  largeur: number;
  hauteur: number;
}

export function lireDimensions(buffer: Buffer): Dimensions | null {
  return png(buffer) ?? webp(buffer) ?? jpeg(buffer);
}

function png(buffer: Buffer): Dimensions | null {
  // Signature PNG, puis un premier chunk IHDR dont les deux premiers champs
  // sont la largeur et la hauteur.
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(0) !== 0x89504e47) return null;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return { largeur: buffer.readUInt32BE(16), hauteur: buffer.readUInt32BE(20) };
}

function webp(buffer: Buffer): Dimensions | null {
  if (buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buffer.toString("ascii", 8, 12) !== "WEBP") return null;

  const format = buffer.toString("ascii", 12, 16);
  if (format === "VP8 ") {
    // Bitstream à clé, dimensions sur 14 bits chacune.
    return {
      largeur: buffer.readUInt16LE(26) & 0x3fff,
      hauteur: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (format === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return {
      largeur: (bits & 0x3fff) + 1,
      hauteur: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (format === "VP8X") {
    // Trois octets par dimension, moins un.
    return {
      largeur: buffer.readUIntLE(24, 3) + 1,
      hauteur: buffer.readUIntLE(27, 3) + 1,
    };
  }
  return null;
}

function jpeg(buffer: Buffer): Dimensions | null {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marqueur = buffer[offset + 1];
    const taille = buffer.readUInt16BE(offset + 2);

    // SOF0..SOF15, en excluant les marqueurs qui ne décrivent pas une trame.
    const estSOF =
      marqueur >= 0xc0 &&
      marqueur <= 0xcf &&
      marqueur !== 0xc4 &&
      marqueur !== 0xc8 &&
      marqueur !== 0xcc;
    if (estSOF) {
      return {
        hauteur: buffer.readUInt16BE(offset + 5),
        largeur: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + taille;
  }
  return null;
}
