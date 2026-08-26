import type { DetailLevel } from "@/lib/lineart/types";

/**
 * La bibliothèque de coloriages gratuits.
 *
 * Les **sujets** vivent ici, dans le dépôt : c'est de la stratégie éditoriale,
 * elle se relit en revue de code et se versionne. Les **dessins**, eux, sont
 * produits depuis l'administration et rangés en base — voir
 * `src/lib/server/coloriages.ts`.
 *
 * Un sujet n'est pas juste un mot : `intro` doit dire quelque chose de vrai et
 * de particulier à ce dessin. Sans ça, mille pages ne se distinguent que par
 * leur image, et Google les traite pour ce qu'elles sont — du remplissage.
 */

export interface Sujet {
  /** Dernier segment d'URL : /coloriages/<theme>/<slug>. */
  slug: string;
  /** Ce qu'on demande au modèle de dessiner. */
  nom: string;
  /** Titre de la page, tel qu'on le cherche. */
  titre: string;
  /** Deux phrases propres à ce dessin, affichées et servant de description. */
  intro: string;
  /** Pilote le niveau de détail demandé au modèle et l'âge annoncé. */
  difficulte: DetailLevel;
}

export interface Theme {
  slug: string;
  nom: string;
  titre: string;
  description: string;
  /** Accroche de la page d'index de la bibliothèque. */
  excerpt: string;
  sujets: Sujet[];
}

const ANIMAUX: Sujet[] = [
  {
    slug: "chat",
    nom: "un chat assis, de face, la queue enroulée autour des pattes",
    titre: "Coloriage chat à imprimer",
    intro:
      "Un chat assis bien de face, la queue enroulée autour des pattes. Les zones sont larges et fermées : c'est un bon premier coloriage pour une main qui débute.",
    difficulte: "tout-petit",
  },
  {
    slug: "chien",
    nom: "un chien assis, oreilles tombantes, la langue sortie",
    titre: "Coloriage chien à imprimer",
    intro:
      "Un chien assis, les oreilles tombantes et la langue sortie. Le poil est suggéré par quelques traits seulement, pour rester facile à colorier.",
    difficulte: "tout-petit",
  },
  {
    slug: "lapin",
    nom: "un lapin assis de profil, grandes oreilles dressées, à côté d'une carotte",
    titre: "Coloriage lapin à imprimer",
    intro:
      "Un lapin aux grandes oreilles dressées, assis près d'une carotte. Les oreilles et le ventre forment de grandes surfaces faciles à remplir.",
    difficulte: "tout-petit",
  },
  {
    slug: "cheval",
    nom: "un cheval au galop, crinière au vent, de profil",
    titre: "Coloriage cheval à imprimer",
    intro:
      "Un cheval au galop, crinière au vent. La crinière et la queue offrent des mèches séparées, agréables à colorier en plusieurs tons.",
    difficulte: "enfant",
  },
  {
    slug: "elephant",
    nom: "un éléphant de profil, trompe levée, grandes oreilles déployées",
    titre: "Coloriage éléphant à imprimer",
    intro:
      "Un éléphant trompe levée, les oreilles bien déployées. Sa silhouette massive laisse d'immenses zones à remplir — parfait pour les feutres épais.",
    difficulte: "tout-petit",
  },
  {
    slug: "lion",
    nom: "un lion assis de face, crinière fournie",
    titre: "Coloriage lion à imprimer",
    intro:
      "Un lion assis de face, crinière fournie. Chaque mèche est une zone fermée : on peut la colorier d'un seul ton ou jouer les dégradés.",
    difficulte: "enfant",
  },
  {
    slug: "girafe",
    nom: "une girafe debout de profil, long cou, taches bien dessinées",
    titre: "Coloriage girafe à imprimer",
    intro:
      "Une girafe debout, le cou tendu. Ses taches sont dessinées une à une : de quoi occuper un enfant longtemps, et travailler la précision.",
    difficulte: "enfant",
  },
  {
    slug: "panda",
    nom: "un panda assis, tenant une tige de bambou entre ses pattes",
    titre: "Coloriage panda à imprimer",
    intro:
      "Un panda assis, une tige de bambou entre les pattes. Les taches noires sont délimitées, ce qui aide à comprendre où poser la couleur.",
    difficulte: "tout-petit",
  },
  {
    slug: "dauphin",
    nom: "un dauphin bondissant au-dessus des vagues",
    titre: "Coloriage dauphin à imprimer",
    intro:
      "Un dauphin en plein saut au-dessus des vagues. Le corps lisse se colorie vite, les vagues offrent le détail pour ceux qui veulent continuer.",
    difficulte: "tout-petit",
  },
  {
    slug: "tortue",
    nom: "une tortue de profil, carapace à motifs géométriques",
    titre: "Coloriage tortue à imprimer",
    intro:
      "Une tortue à la carapace découpée en écailles géométriques. Chaque écaille peut prendre sa propre couleur : le résultat est toujours réussi.",
    difficulte: "enfant",
  },
  {
    slug: "hibou",
    nom: "un hibou de face perché sur une branche, grands yeux ronds",
    titre: "Coloriage hibou à imprimer",
    intro:
      "Un hibou perché, les yeux grands ouverts. Les plumes du poitrail forment des rangées régulières, très satisfaisantes à colorier.",
    difficulte: "enfant",
  },
  {
    slug: "renard",
    nom: "un renard assis de profil, queue touffue ramenée devant lui",
    titre: "Coloriage renard à imprimer",
    intro:
      "Un renard assis, sa queue touffue ramenée devant lui. Une silhouette simple, avec juste ce qu'il faut de détail dans le pelage.",
    difficulte: "tout-petit",
  },
  {
    slug: "ours",
    nom: "un ours brun debout sur ses pattes arrière, dans une clairière",
    titre: "Coloriage ours à imprimer",
    intro:
      "Un ours dressé sur ses pattes arrière au milieu d'une clairière. Grandes surfaces pour l'animal, petits détails pour les herbes autour.",
    difficulte: "tout-petit",
  },
  {
    slug: "loup",
    nom: "un loup hurlant, assis, de profil, la tête levée vers le ciel",
    titre: "Coloriage loup à imprimer",
    intro:
      "Un loup assis, la tête levée en plein hurlement. Le pelage est dessiné par mèches : un coloriage qui plaît aux plus grands.",
    difficulte: "ado",
  },
  {
    slug: "ecureuil",
    nom: "un écureuil assis tenant un gland, queue en panache",
    titre: "Coloriage écureuil à imprimer",
    intro:
      "Un écureuil assis, un gland entre les pattes et la queue en panache. La queue occupe la moitié du dessin et se colorie d'un trait.",
    difficulte: "enfant",
  },
  {
    slug: "herisson",
    nom: "un hérisson de profil, piquants bien séparés, museau pointu",
    titre: "Coloriage hérisson à imprimer",
    intro:
      "Un hérisson de profil, piquants bien séparés. Chaque piquant est un trait fermé — un bon exercice pour apprendre à ne pas dépasser.",
    difficulte: "enfant",
  },
  {
    slug: "vache",
    nom: "une vache debout de profil dans un pré, taches sur le flanc, cloche au cou",
    titre: "Coloriage vache à imprimer",
    intro:
      "Une vache dans son pré, la cloche au cou et les taches bien marquées sur le flanc. Les taches se colorient en noir, le reste en blanc… ou pas.",
    difficulte: "tout-petit",
  },
  {
    slug: "mouton",
    nom: "un mouton debout de profil, toison bouclée",
    titre: "Coloriage mouton à imprimer",
    intro:
      "Un mouton à la toison bouclée. Les boucles forment un motif régulier qui occupe tout le corps : long à colorier, très reposant.",
    difficulte: "tout-petit",
  },
  {
    slug: "cochon",
    nom: "un cochon debout de profil, groin rond et queue en tire-bouchon",
    titre: "Coloriage cochon à imprimer",
    intro:
      "Un cochon au groin rond et à la queue en tire-bouchon. Trois ou quatre zones en tout : le coloriage se termine avant que l'attention ne parte.",
    difficulte: "tout-petit",
  },
  {
    slug: "poule",
    nom: "une poule debout de profil avec ses poussins",
    titre: "Coloriage poule à imprimer",
    intro:
      "Une poule et ses poussins qui la suivent. Les poussins sont assez petits pour être coloriés d'un seul geste, la poule demande un peu plus.",
    difficulte: "tout-petit",
  },
  {
    slug: "canard",
    nom: "un canard nageant sur l'eau, quelques roseaux autour",
    titre: "Coloriage canard à imprimer",
    intro:
      "Un canard sur l'eau, entre deux roseaux. Le reflet et les ondulations donnent un motif simple à remplir tout autour de l'animal.",
    difficulte: "tout-petit",
  },
  {
    slug: "grenouille",
    nom: "une grenouille assise sur un nénuphar, pattes repliées",
    titre: "Coloriage grenouille à imprimer",
    intro:
      "Une grenouille posée sur son nénuphar, les pattes repliées. La feuille ronde en dessous fait une grande zone à colorier d'un seul vert.",
    difficulte: "tout-petit",
  },
  {
    slug: "escargot",
    nom: "un escargot de profil, coquille en spirale, sur une feuille",
    titre: "Coloriage escargot à imprimer",
    intro:
      "Un escargot sur sa feuille, la coquille en spirale bien dessinée. La spirale se colorie en anneaux successifs : simple et joli.",
    difficulte: "tout-petit",
  },
  {
    slug: "papillon",
    nom: "un papillon ailes déployées vu de dessus, motifs symétriques sur les ailes",
    titre: "Coloriage papillon à imprimer",
    intro:
      "Un papillon ailes déployées, aux motifs parfaitement symétriques. On peut colorier les deux ailes à l'identique — ou pas du tout.",
    difficulte: "enfant",
  },
  {
    slug: "coccinelle",
    nom: "une coccinelle vue de dessus sur une feuille, points bien marqués",
    titre: "Coloriage coccinelle à imprimer",
    intro:
      "Une coccinelle posée sur une feuille, les points bien détachés. Peu de zones, très contrastées : idéal pour les tout-petits.",
    difficulte: "tout-petit",
  },
  {
    slug: "abeille",
    nom: "une abeille en vol devant une fleur, rayures marquées",
    titre: "Coloriage abeille à imprimer",
    intro:
      "Une abeille en vol devant une fleur, les rayures bien séparées. Les ailes restent transparentes : on les laisse blanches, ou pas.",
    difficulte: "tout-petit",
  },
  {
    slug: "poisson",
    nom: "un poisson tropical de profil, écailles dessinées, quelques bulles",
    titre: "Coloriage poisson à imprimer",
    intro:
      "Un poisson tropical aux écailles dessinées une à une, entouré de bulles. Chaque écaille peut prendre une couleur différente.",
    difficulte: "enfant",
  },
  {
    slug: "pingouin",
    nom: "un manchot debout de face sur la banquise",
    titre: "Coloriage pingouin à imprimer",
    intro:
      "Un manchot debout sur la banquise. Le ventre blanc et le dos noir sont nettement séparés : le dessin se lit tout de suite.",
    difficulte: "tout-petit",
  },
  {
    slug: "singe",
    nom: "un singe suspendu par un bras à une branche, l'autre main tenant une banane",
    titre: "Coloriage singe à imprimer",
    intro:
      "Un singe suspendu à sa branche, une banane à la main. La pose amuse et le feuillage donne de quoi continuer une fois l'animal terminé.",
    difficulte: "enfant",
  },
  {
    slug: "zebre",
    nom: "un zèbre debout de profil, rayures nettes et régulières",
    titre: "Coloriage zèbre à imprimer",
    intro:
      "Un zèbre de profil, rayures nettes. À colorier en noir et blanc comme il se doit, ou en n'importe quoi d'autre — c'est encore mieux.",
    difficulte: "enfant",
  },
  {
    slug: "tigre",
    nom: "un tigre marchant de profil, rayures marquées, regard vers l'avant",
    titre: "Coloriage tigre à imprimer",
    intro:
      "Un tigre en marche, le regard droit devant. Les rayures suivent la courbe du corps : un beau travail de patience pour les plus grands.",
    difficulte: "ado",
  },
  {
    slug: "crocodile",
    nom: "un crocodile de profil, gueule entrouverte, écailles dorsales",
    titre: "Coloriage crocodile à imprimer",
    intro:
      "Un crocodile gueule entrouverte, la rangée d'écailles bien visible sur le dos. Les dents font toujours leur effet.",
    difficulte: "enfant",
  },
  {
    slug: "serpent",
    nom: "un serpent enroulé en spirale, motifs sur le dos, langue sortie",
    titre: "Coloriage serpent à imprimer",
    intro:
      "Un serpent enroulé sur lui-même, le dos couvert de motifs. La spirale guide la main du centre vers l'extérieur.",
    difficulte: "enfant",
  },
  {
    slug: "perroquet",
    nom: "un perroquet perché sur une branche, ailes repliées, longue queue",
    titre: "Coloriage perroquet à imprimer",
    intro:
      "Un perroquet perché, la longue queue tombant sous la branche. Les plumes sont séparées : c'est le dessin idéal pour sortir toutes les couleurs.",
    difficulte: "enfant",
  },
  {
    slug: "flamant-rose",
    nom: "un flamant rose debout sur une patte, cou recourbé",
    titre: "Coloriage flamant rose à imprimer",
    intro:
      "Un flamant sur une patte, le cou en S. Une silhouette élégante et peu de zones : le coloriage se termine vite et rend bien.",
    difficulte: "tout-petit",
  },
  {
    slug: "baleine",
    nom: "une baleine soufflant un jet d'eau, vue de profil sur les vagues",
    titre: "Coloriage baleine à imprimer",
    intro:
      "Une baleine qui souffle son jet d'eau au-dessus des vagues. L'animal occupe presque toute la page : parfait pour les gros feutres.",
    difficulte: "tout-petit",
  },
];

export const THEMES: Theme[] = [
  {
    slug: "animaux",
    nom: "Animaux",
    titre: "Coloriages d'animaux à imprimer",
    description:
      "Des coloriages d'animaux gratuits à imprimer en A4 : chat, éléphant, papillon, tigre et une trentaine d'autres. Contours nets, zones fermées, prêts pour les feutres.",
    excerpt:
      "Du chat de salon à la baleine : des dessins au trait, à imprimer et à colorier tout de suite.",
    sujets: ANIMAUX,
  },
];

export function getTheme(slug: string): Theme | undefined {
  return THEMES.find((theme) => theme.slug === slug);
}

export function getSujet(themeSlug: string, slug: string): Sujet | undefined {
  return getTheme(themeSlug)?.sujets.find((sujet) => sujet.slug === slug);
}

/** Tous les sujets, thème compris — pour l'administration et le sitemap. */
export function tousLesSujets(): { theme: Theme; sujet: Sujet }[] {
  return THEMES.flatMap((theme) =>
    theme.sujets.map((sujet) => ({ theme, sujet })),
  );
}

/**
 * Extensions servies. Le modèle décide du format qu'il renvoie : on suit, on
 * ne le renomme pas. Une URL en `.png` qui sert du JPEG ment sur son contenu,
 * et c'est justement l'URL que Google Images indexe.
 */
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function extensionPour(mime: string): string {
  return EXTENSIONS[mime] ?? "png";
}

/**
 * Nom de fichier de l'image. Il est descriptif à dessein : c'est un des
 * signaux que Google Images utilise, et c'est de là que vient l'essentiel du
 * trafic sur ce type de page.
 */
export function nomFichierImage(slug: string, mime: string): string {
  return `coloriage-${slug}-a-imprimer.${extensionPour(mime)}`;
}

/** L'inverse, pour la route qui sert les images. */
export function slugDepuisNomFichier(
  fichier: string,
): { slug: string; extension: string } | null {
  const match = /^coloriage-(.+)-a-imprimer\.([a-z]+)$/.exec(fichier);
  return match ? { slug: match[1], extension: match[2] } : null;
}

const AGES: Record<DetailLevel, string> = {
  "tout-petit": "Dès 3 ans",
  enfant: "Dès 5 ans",
  ado: "Dès 8 ans",
};

export function ageConseille(difficulte: DetailLevel): string {
  return AGES[difficulte];
}
