import type { MetadataRoute } from "next";
import { getSujet, THEMES } from "@/lib/coloriages/themes";
import { GUIDES } from "@/lib/guides";
import { listerPublies } from "@/lib/server/coloriages";
import { SITE_URL } from "@/lib/site";

/**
 * Seules les pages indexables y figurent : landing, guides, bibliothèque,
 * pages légales. Ni le tunnel d'achat, ni l'administration.
 *
 * Il lit la base pour connaître les coloriages publiés, donc il ne peut pas
 * être calculé au build : la base n'est joignable qu'à l'exécution. Publier
 * un dessin le rafraîchit (`revalidatePath`).
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  // Si la base est muette, on publie quand même un sitemap valide : mieux vaut
  // perdre la bibliothèque qu'une erreur 500 sur /sitemap.xml.
  const publies = await listerPublies().catch(() => []);
  const themesPublies = new Set(publies.map((dessin) => dessin.theme));

  // La date d'une fiche est la plus récente de la publication de son image et
  // de la révision de son texte : réécrire une fiche doit se voir à Google.
  const datesFiches = publies.map((dessin) => ({
    dessin,
    date: plusRecente(
      dessin.publieLe,
      depuisIso(getSujet(dessin.theme, dessin.slug)?.reviseLe),
    ),
  }));

  const coloriages = datesFiches.map(({ dessin, date }) => ({
    url: `${SITE_URL}/coloriages/${dessin.theme}/${dessin.slug}`,
    lastModified: date !== null ? new Date(date) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Un hub change avec chacune de ses fiches et avec son propre texte : sa
  // date est la plus récente de toutes, absente si aucune n'est datée.
  const derniereFiche = new Map<string, number>();
  for (const { dessin, date } of datesFiches) {
    const actuelle = plusRecente(derniereFiche.get(dessin.theme) ?? null, date);
    if (actuelle !== null) derniereFiche.set(dessin.theme, actuelle);
  }

  const themes = THEMES.filter((theme) => themesPublies.has(theme.slug)).map(
    (theme) => {
      const derniere = plusRecente(
        derniereFiche.get(theme.slug) ?? null,
        depuisIso(theme.reviseLe),
      );
      return {
        url: `${SITE_URL}/coloriages/${theme.slug}`,
        lastModified: derniere !== null ? new Date(derniere) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    },
  );

  const legal = [
    "/mentions-legales",
    "/cgv",
    "/confidentialite",
    "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/creer`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/guides`, changeFrequency: "monthly", priority: 0.7 },
    ...guides,
    ...(publies.length > 0
      ? [
          {
            url: `${SITE_URL}/coloriages`,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ]
      : []),
    ...themes,
    ...coloriages,
    ...legal,
  ];
}

/** Une date ISO en millisecondes ; absente ou illisible, elle ne compte pas. */
function depuisIso(iso: string | undefined): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

function plusRecente(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}
