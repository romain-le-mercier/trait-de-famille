import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/server/admin";
import { listerParTheme } from "@/lib/server/coloriages";
import { engineConfigured } from "@/lib/server/litellm";
import { getTheme } from "@/lib/coloriages/themes";

/**
 * L'état d'un thème : chaque sujet du dépôt, avec le dessin qui lui correspond
 * en base s'il en existe un. C'est ce que l'écran d'administration affiche.
 */
export async function GET(request: Request) {
  if (!(await getAdmin())) {
    return new NextResponse("Not found", { status: 404 });
  }

  const themeSlug = new URL(request.url).searchParams.get("theme") ?? "";
  const theme = getTheme(themeSlug);
  if (!theme) {
    return NextResponse.json({ message: "Thème inconnu." }, { status: 404 });
  }

  const existants = new Map(
    (await listerParTheme(theme.slug)).map((row) => [row.slug, row]),
  );

  return NextResponse.json(
    {
      moteurPret: engineConfigured(),
      sujets: theme.sujets.map((sujet) => {
        const dessin = existants.get(sujet.slug);
        return {
          slug: sujet.slug,
          titre: sujet.titre,
          nom: sujet.nom,
          difficulte: sujet.difficulte,
          statut: dessin?.statut ?? null,
          genereLe: dessin?.genereLe ?? null,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
