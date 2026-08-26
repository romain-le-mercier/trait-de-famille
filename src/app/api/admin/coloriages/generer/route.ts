import { NextResponse } from "next/server";
import { promptColoriage } from "@/lib/coloriages/prompts";
import { getSujet, getTheme } from "@/lib/coloriages/themes";
import { getAdmin } from "@/lib/server/admin";
import { enregistrer } from "@/lib/server/coloriages";
import { lireDimensions } from "@/lib/server/imageInfo";
import {
  engineConfigured,
  generateImage,
  isNetworkError,
} from "@/lib/server/litellm";

/**
 * Génère **un** dessin de la bibliothèque et le range en brouillon.
 *
 * Un seul à la fois, à dessein : c'est le client qui enchaîne. Chaque appel
 * coûte, et une boucle côté serveur rendrait la dépense invisible et
 * impossible à interrompre. Ici l'administrateur voit défiler les sujets et
 * peut arrêter au deuxième s'il n'aime pas ce qui sort.
 */
export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!engineConfigured()) {
    return NextResponse.json(
      { message: "Le moteur de génération n'est pas configuré." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const themeSlug = String(body?.theme ?? "");
  const slug = String(body?.slug ?? "");

  const theme = getTheme(themeSlug);
  const sujet = getSujet(themeSlug, slug);
  if (!theme || !sujet) {
    return NextResponse.json({ message: "Sujet inconnu." }, { status: 404 });
  }

  const startedAt = Date.now();
  try {
    const image = await generateImage({
      prompt: promptColoriage(sujet.nom, sujet.difficulte),
    });
    const donnees = Buffer.from(image.data);

    const dimensions = lireDimensions(donnees);
    if (!dimensions) {
      // Mieux vaut refuser que stocker une taille inventée : elle servirait à
      // réserver la place de l'image et casserait la mise en page.
      throw new Error("Format d'image non reconnu.");
    }

    await enregistrer({
      slug: sujet.slug,
      theme: theme.slug,
      largeur: dimensions.largeur,
      hauteur: dimensions.hauteur,
      mime: image.mimeType,
      donnees,
    });

    console.log(
      `[bibliotheque] ${theme.slug}/${sujet.slug} généré en ` +
        `${((Date.now() - startedAt) / 1000).toFixed(1)}s · ` +
        `${Math.round(donnees.length / 1024)} Ko · ` +
        `${dimensions.largeur}×${dimensions.hauteur}`,
    );

    return NextResponse.json({
      slug: sujet.slug,
      statut: "brouillon",
      largeur: dimensions.largeur,
      hauteur: dimensions.hauteur,
    });
  } catch (error) {
    console.error(`[bibliotheque] échec sur ${theme.slug}/${sujet.slug}`, error);
    return NextResponse.json(
      {
        message: isNetworkError(error)
          ? "Le moteur est injoignable."
          : error instanceof Error
            ? error.message
            : "La génération a échoué.",
      },
      { status: 502 },
    );
  }
}
