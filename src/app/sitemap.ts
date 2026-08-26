import type { MetadataRoute } from "next";
import { THEMES } from "@/lib/coloriages/themes";
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

  const coloriages = publies.map((dessin) => ({
    url: `${SITE_URL}/coloriages/${dessin.theme}/${dessin.slug}`,
    lastModified: dessin.publieLe ? new Date(dessin.publieLe) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const themes = THEMES.filter((theme) => themesPublies.has(theme.slug)).map(
    (theme) => ({
      url: `${SITE_URL}/coloriages/${theme.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
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
