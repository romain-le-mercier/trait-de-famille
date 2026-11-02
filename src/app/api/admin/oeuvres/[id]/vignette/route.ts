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
  const oeuvre = await parId(id).catch(() => null);
  if (!oeuvre) return introuvable();

  let original: Buffer | null;
  try {
    original = await lire(oeuvre.id);
  } catch {
    return introuvable();
  }
  if (!original) return introuvable();

  const vignette = await sharp(original)
    .resize({ width: LARGEUR, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  return new NextResponse(new Uint8Array(vignette), {
    headers: {
      "Content-Type": "image/webp",
      // Jamais en cache partagé : la réponse dépend de la session.
      "Cache-Control": "private, no-store",
    },
  });
}
