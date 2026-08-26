import { NextResponse } from "next/server";
import { extensionPour, slugDepuisNomFichier } from "@/lib/coloriages/themes";
import { getImage } from "@/lib/server/coloriages";

/**
 * Sert les dessins publiés.
 *
 * L'adresse est `/coloriages/image/coloriage-<sujet>-a-imprimer.png` : un nom
 * de fichier lisible, parce que c'est un des signaux de Google Images — d'où
 * vient l'essentiel du trafic sur ce type de page.
 *
 * ⚠️ Ce segment `image` est réservé : il masquerait un thème qui porterait le
 * même slug.
 *
 * Un brouillon répond 404 ici. La relecture passe par la route
 * d'administration, qui n'est ni publique ni mise en cache.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fichier: string }> },
) {
  const { fichier } = await params;
  const demande = slugDepuisNomFichier(fichier);
  if (!demande) return new NextResponse("Not found", { status: 404 });

  const image = await getImage(demande.slug);
  if (!image) return new NextResponse("Not found", { status: 404 });

  // Une seule adresse par dessin : servir la même image sous .png et sous .jpg
  // en ferait deux, que Google traiterait comme des doublons.
  if (demande.extension !== extensionPour(image.mime)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Régénérer un dessin change sa date : l'ETag suit, et les caches
  // intermédiaires cessent de servir l'ancienne image.
  const etag = `"${demande.slug}-${image.genereLe.getTime()}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  return new NextResponse(new Uint8Array(image.donnees), {
    headers: {
      "Content-Type": image.mime,
      ETag: etag,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
