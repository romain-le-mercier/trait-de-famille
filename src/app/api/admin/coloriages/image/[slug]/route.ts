import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/server/admin";
import { getImageBrouillon } from "@/lib/server/coloriages";

/**
 * L'image d'un dessin quel que soit son statut, pour la relecture.
 *
 * Jamais mise en cache : régénérer un sujet doit montrer le nouveau dessin
 * immédiatement, sinon on validerait le précédent sans le savoir.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await getAdmin())) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { slug } = await params;
  const image = await getImageBrouillon(slug);
  if (!image) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(image.donnees), {
    headers: { "Content-Type": image.mime, "Cache-Control": "no-store" },
  });
}
