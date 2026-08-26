import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getTheme } from "@/lib/coloriages/themes";
import { getAdmin } from "@/lib/server/admin";
import { changerStatut, getColoriage, type Statut } from "@/lib/server/coloriages";

const STATUTS: Statut[] = ["brouillon", "publie", "rejete"];

/**
 * Publie ou rejette un dessin.
 *
 * La publication vide le cache des pages concernées : sans ça, le dessin
 * n'apparaîtrait qu'au prochain déploiement, et l'administration donnerait
 * l'illusion d'avoir publié.
 */
export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  const statut = String(body?.statut ?? "") as Statut;

  if (!STATUTS.includes(statut)) {
    return NextResponse.json({ message: "Statut inconnu." }, { status: 400 });
  }

  const existant = await getColoriage(slug);
  if (!existant) {
    return NextResponse.json({ message: "Dessin inconnu." }, { status: 404 });
  }

  await changerStatut(slug, statut);

  const theme = getTheme(existant.theme);
  revalidatePath("/coloriages");
  revalidatePath("/sitemap.xml");
  if (theme) {
    revalidatePath(`/coloriages/${theme.slug}`);
    revalidatePath(`/coloriages/${theme.slug}/${slug}`);
  }

  return NextResponse.json({ slug, statut });
}
