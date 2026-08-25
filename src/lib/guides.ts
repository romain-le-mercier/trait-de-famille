/**
 * Les guides : le seul contenu du site qui vise la recherche organique.
 *
 * Les métadonnées vivent ici pour que la page d'index, le sitemap et chaque
 * article restent d'accord entre eux. Le corps de l'article, lui, reste dans
 * son fichier `page.tsx`.
 */
export interface Guide {
  slug: string;
  /** Balise <title>, sans le suffixe de marque ajouté par le template. */
  title: string;
  /** Titre affiché en haut de l'article. */
  heading: string;
  description: string;
  /** Accroche de la page d'index. */
  excerpt: string;
  /** Date de dernière révision, au format ISO. */
  updated: string;
  readingMinutes: number;
}

export const GUIDES: Guide[] = [
  {
    slug: "transformer-une-photo-en-coloriage",
    title: "Transformer une photo en coloriage à imprimer",
    heading: "Transformer une photo en coloriage à imprimer",
    description:
      "Les trois méthodes pour convertir une photo en dessin au trait à colorier : filtres gratuits, logiciels de retouche, génération automatique. Ce que chacune donne vraiment.",
    excerpt:
      "Filtre gratuit, Photoshop ou génération automatique : ce que donne vraiment chaque méthode, et laquelle choisir selon la photo.",
    updated: "2026-03-12",
    readingMinutes: 6,
  },
  {
    slug: "quelle-photo-choisir",
    title: "Quelle photo choisir pour un beau coloriage",
    heading: "Quelle photo choisir pour un beau coloriage",
    description:
      "Lumière, cadrage, netteté, arrière-plan : les critères qui font la différence entre un coloriage réussi et un dessin illisible, avec les cas qui ne marchent pas.",
    excerpt:
      "Lumière, cadrage, arrière-plan : les critères qui séparent un coloriage réussi d'un dessin illisible.",
    updated: "2026-04-28",
    readingMinutes: 5,
  },
  {
    slug: "cadeau-grands-parents",
    title: "Offrir un coloriage aux grands-parents : l'idée cadeau",
    heading: "Offrir un coloriage aux grands-parents",
    description:
      "Un cadeau fait main qui ne coûte presque rien et qui touche : le portrait des petits-enfants en dessin au trait, à colorier ensemble puis à encadrer.",
    excerpt:
      "Un cadeau qui ne coûte presque rien, se prépare en une soirée, et se garde des années.",
    updated: "2026-05-19",
    readingMinutes: 4,
  },
  {
    slug: "activites-enfants-jour-de-pluie",
    title: "Activités pour les enfants un jour de pluie",
    heading: "Que faire avec les enfants un jour de pluie",
    description:
      "Neuf activités calmes qui tiennent vraiment une après-midi, avec ce qu'elles demandent de préparation et l'âge auquel elles fonctionnent.",
    excerpt:
      "Neuf activités calmes qui tiennent une après-midi, classées par temps de préparation.",
    updated: "2026-06-30",
    readingMinutes: 7,
  },
  {
    slug: "anniversaire-enfant-coloriage",
    title: "Animer un anniversaire d'enfant avec des coloriages",
    heading: "Animer un anniversaire d'enfant avec des coloriages",
    description:
      "L'atelier coloriage comme temps calme au milieu d'un goûter d'anniversaire : quand le placer, comment le préparer, et ce qu'il faut prévoir par enfant.",
    excerpt:
      "Le temps calme qui sauve un goûter d'anniversaire : quand le placer et quoi prévoir.",
    updated: "2026-08-11",
    readingMinutes: 5,
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

/** Les guides du plus récent au plus ancien, pour l'affichage. */
export function guidesByDate(): Guide[] {
  return [...GUIDES].sort((a, b) => b.updated.localeCompare(a.updated));
}

export const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
