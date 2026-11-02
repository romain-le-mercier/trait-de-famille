import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdmin } from "@/lib/server/admin";
import { parId } from "@/lib/server/oeuvres";
import { lire } from "@/lib/server/stockage";

/**
 * La vignette d'une œuvre, payée ou non, pour le tableau de bord (T-011).
 *
 * Réservée à l'admin : c'est la seule URL qui montre un essai non payé, et
 * elle répond 404 à tout le monde d'autre, comme le reste de l'admin. Une
 * vignette réduite, pas l'original : l'admin a besoin de reconnaître un
 * dessin, pas de le télécharger.
 */
export const dynamic = "force-dynamic";

const LARGEUR = 160;

const introuvable = () => new NextResponse("Not found", { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdmin())) return introuvable();

  const { id } = await params;
  // `parId` d'abord : un identifiant inconnu de la base ne touche pas au disque.
  const oeuvre = await parId(id).catch((error) => {
    console.error("[vignette] lecture en base impossible", error);
    return null;
  });
  if (!oeuvre) return introuvable();

  // Fichier absent, illisible ou corrompu : même réponse, pas de 500.
  let vignette: Buffer;
  try {
    const original = await lire(oeuvre.id);
    if (!original) return introuvable();
    vignette = await sharp(original)
      .resize({ width: LARGEUR, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();
  } catch (error) {
    // L'identifiant seul : un fichier illisible peut être une œuvre payée
    // qu'on ne sait plus livrer, et ce log est la seule trace.
    console.error("[vignette] fichier illisible", oeuvre.id, error);
    return introuvable();
  }

  return new NextResponse(new Uint8Array(vignette), {
    headers: {
      "Content-Type": "image/webp",
      // Aucun cache, même privé : après déconnexion, le navigateur ne doit
      // plus pouvoir resservir un essai non payé sans repasser par la garde.
      "Cache-Control": "private, no-store",
    },
  });
}
