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
  /**
   * Ce que montre le dessin, écrit d'après l'image publiée et non d'après
   * `nom` : le modèle ne dessine pas toujours ce qu'on lui demande, et une
   * description fausse se voit au premier coup d'œil.
   */
  dessin?: string;
  /** Zones, âge annoncé et pourquoi, idées de couleurs. */
  colorier?: string;
  /** Un usage du dessin imprimé, pour Noël. */
  ideeNoel?: string;
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

/**
 * Deuxième thème. Les dinosaures sont, après les animaux, ce qu'on cherche le
 * plus en coloriage à imprimer — et la demande ne dépend d'aucune saison.
 *
 * Deux principes de composition, appris sur le lot animaux : un sujet par
 * page, occupant vraiment la page ; et des noms savants toujours doublés du
 * nom que les enfants emploient, parce que c'est celui qu'on tape.
 */
const DINOSAURES: Sujet[] = [
  {
    slug: "dinosaure",
    nom: "un dinosaure sympathique debout sur deux pattes, gros yeux ronds, petite queue relevée",
    titre: "Coloriage dinosaure à imprimer",
    intro:
      "Un dinosaure debout sur deux pattes, avec de gros yeux ronds et une queue relevée. C'est le plus simple de la série : quelques grandes zones, rien de pointu, idéal pour commencer.",
    difficulte: "tout-petit",
  },
  {
    slug: "t-rex",
    nom: "un tyrannosaure rex debout, gueule ouverte montrant les dents, petits bras, longue queue en équilibre",
    titre: "Coloriage T-Rex à imprimer",
    intro:
      "Le tyrannosaure en position d'attaque, gueule ouverte et queue tendue en équilibre. Les dents forment une rangée de petites zones : de quoi occuper les feutres fins après avoir rempli le corps.",
    difficulte: "enfant",
  },
  {
    slug: "diplodocus",
    nom: "un diplodocus de profil, très long cou tendu vers un arbre, longue queue horizontale",
    titre: "Coloriage diplodocus à imprimer",
    intro:
      "Un diplodocus de profil, le cou tendu vers le feuillage d'un arbre. Le corps traverse toute la largeur de la feuille — c'est le dessin de la série qui se colorie le plus vite.",
    difficulte: "tout-petit",
  },
  {
    slug: "triceratops",
    nom: "un tricératops de trois quarts, sa collerette osseuse et ses trois cornes bien visibles",
    titre: "Coloriage tricératops à imprimer",
    intro:
      "Un tricératops de trois quarts, collerette déployée et trois cornes en avant. La collerette est découpée en plaques : elle appelle une couleur différente par plaque, et le dessin y gagne.",
    difficulte: "enfant",
  },
  {
    slug: "stegosaure",
    nom: "un stégosaure de profil, double rangée de plaques dorsales et quatre pointes au bout de la queue",
    titre: "Coloriage stégosaure à imprimer",
    intro:
      "Un stégosaure de profil, avec sa double rangée de plaques sur le dos et les quatre pointes de sa queue. Les plaques sont des zones bien séparées : c'est le dessin parfait pour un dégradé.",
    difficulte: "enfant",
  },
  {
    slug: "velociraptor",
    nom: "un vélociraptor en course, penché vers l'avant, la grande griffe recourbée levée",
    titre: "Coloriage vélociraptor à imprimer",
    intro:
      "Un vélociraptor en pleine course, le corps penché à l'horizontale et la grande griffe du pied relevée. Les pattes fines demandent une main déjà sûre.",
    difficulte: "ado",
  },
  {
    slug: "brachiosaure",
    nom: "un brachiosaure vu de côté, pattes avant plus hautes que les pattes arrière, tête minuscule au bout d'un cou dressé",
    titre: "Coloriage brachiosaure à imprimer",
    intro:
      "Un brachiosaure dressé, pattes avant plus longues que les arrière et petite tête tout en haut du cou. Le dessin se lit à la verticale : il remplit la feuille dans le sens de la hauteur.",
    difficulte: "tout-petit",
  },
  {
    slug: "spinosaure",
    nom: "un spinosaure de profil, grande voile dorsale nervurée, museau allongé de crocodile",
    titre: "Coloriage spinosaure à imprimer",
    intro:
      "Un spinosaure de profil, avec sa grande voile dorsale nervurée et son museau allongé de crocodile. La voile est divisée par ses nervures en une dizaine de bandes à colorier séparément.",
    difficulte: "ado",
  },
  {
    slug: "ankylosaure",
    nom: "un ankylosaure vu de trois quarts, dos couvert de plaques, massue osseuse au bout de la queue",
    titre: "Coloriage ankylosaure à imprimer",
    intro:
      "Un ankylosaure ramassé sur ses pattes, le dos couvert de plaques et la massue de sa queue posée au sol. La carapace forme une mosaïque de petites zones fermées.",
    difficulte: "enfant",
  },
  {
    slug: "parasaurolophus",
    nom: "un parasaurolophus debout, longue crête creuse recourbée vers l'arrière du crâne",
    titre: "Coloriage parasaurolophus à imprimer",
    intro:
      "Un parasaurolophus debout, reconnaissable à la longue crête creuse qui part de son crâne vers l'arrière. Le corps est tout en courbes, sans un seul angle vif.",
    difficulte: "enfant",
  },
  {
    slug: "pteranodon",
    nom: "un ptéranodon en vol, ailes largement déployées, crête pointue à l'arrière de la tête",
    titre: "Coloriage ptéranodon à imprimer",
    intro:
      "Un ptéranodon en vol, les ailes déployées d'un bord à l'autre de la feuille. Les membranes des ailes sont deux grandes surfaces vides : parfaites pour essayer un ciel au feutre.",
    difficulte: "enfant",
  },
  {
    slug: "iguanodon",
    nom: "un iguanodon debout, la pointe caractéristique de son pouce dressée",
    titre: "Coloriage iguanodon à imprimer",
    intro:
      "Un iguanodon debout, avec la pointe de son pouce dressée comme un éperon — le détail qui l'a fait connaître. Le reste du dessin est volontairement sobre.",
    difficulte: "enfant",
  },
  {
    slug: "allosaure",
    nom: "un allosaure en marche, gueule entrouverte, deux petites crêtes au-dessus des yeux",
    titre: "Coloriage allosaure à imprimer",
    intro:
      "Un allosaure en marche, la gueule entrouverte et deux petites crêtes au-dessus des yeux. Plus élancé que le tyrannosaure, avec des bras nettement plus longs.",
    difficulte: "enfant",
  },
  {
    slug: "mosasaure",
    nom: "un mosasaure nageant, corps allongé de lézard marin, quatre nageoires et queue puissante",
    titre: "Coloriage mosasaure à imprimer",
    intro:
      "Un mosasaure qui file dans l'eau, corps de lézard allongé, quatre nageoires et une queue large. Ce n'était pas un dinosaure mais un reptile marin — la page le dit, autant l'apprendre en coloriant.",
    difficulte: "enfant",
  },
  {
    slug: "plesiosaure",
    nom: "un plésiosaure émergeant de l'eau, long cou dressé, corps trapu à quatre nageoires",
    titre: "Coloriage plésiosaure à imprimer",
    intro:
      "Un plésiosaure qui sort la tête de l'eau au bout de son long cou, le corps porté par quatre nageoires. La ligne d'eau coupe le dessin en deux : deux ambiances à colorier différemment.",
    difficulte: "enfant",
  },
  {
    slug: "dimetrodon",
    nom: "un dimétrodon de profil, grande voile dorsale tendue sur des épines, pattes écartées de reptile",
    titre: "Coloriage dimétrodon à imprimer",
    intro:
      "Un dimétrodon de profil, la voile de son dos tendue sur de longues épines. Il vivait bien avant les dinosaures : c'est le plus ancien de toute la série.",
    difficulte: "enfant",
  },
  {
    slug: "archeopteryx",
    nom: "un archéoptéryx perché sur une branche, ailes emplumées et longue queue à plumes",
    titre: "Coloriage archéoptéryx à imprimer",
    intro:
      "Un archéoptéryx posé sur une branche, ailes emplumées et longue queue à plumes. Le plumage demande beaucoup de petits traits : c'est le dessin le plus exigeant de la série.",
    difficulte: "ado",
  },
  {
    slug: "bebe-dinosaure",
    nom: "un bébé dinosaure qui sort d'un œuf fendu, coquille brisée autour de lui",
    titre: "Coloriage bébé dinosaure à imprimer",
    intro:
      "Un bébé dinosaure qui sort d'un œuf fendu, entouré de morceaux de coquille. Les formes sont rondes et les zones larges : c'est le plus facile de la série avec le dinosaure sympathique.",
    difficulte: "tout-petit",
  },
  {
    slug: "oeuf-de-dinosaure",
    nom: "trois œufs de dinosaure dans un nid de branchages, l'un d'eux commençant à se fendre",
    titre: "Coloriage œuf de dinosaure à imprimer",
    intro:
      "Trois œufs posés dans un nid de branchages, dont un qui commence à se fendre. Les branches du nid forment un entrelacs à colorier au feutre fin, autour de trois grandes formes simples.",
    difficulte: "tout-petit",
  },
  {
    slug: "squelette-de-dinosaure",
    nom: "un squelette complet de tyrannosaure monté comme dans un musée, chaque os détouré",
    titre: "Coloriage squelette de dinosaure à imprimer",
    intro:
      "Un squelette de tyrannosaure monté comme au musée, chaque os détouré séparément. Des dizaines de petites zones : à réserver aux enfants qui aiment prendre leur temps.",
    difficulte: "ado",
  },
  {
    slug: "volcan-et-dinosaures",
    nom: "un paysage préhistorique avec deux dinosaures au premier plan, fougères géantes et un volcan qui fume au loin",
    titre: "Coloriage volcan et dinosaures à imprimer",
    intro:
      "Un paysage préhistorique complet : deux dinosaures au premier plan, des fougères géantes et un volcan qui fume à l'horizon. C'est le seul de la série qui raconte une scène entière.",
    difficulte: "enfant",
  },
  {
    slug: "famille-de-dinosaures",
    nom: "un grand dinosaure adulte accompagné de deux petits qui le suivent",
    titre: "Coloriage famille de dinosaures à imprimer",
    intro:
      "Un grand dinosaure suivi de ses deux petits, tous les trois de profil. Les trois tailles permettent de choisir un feutre par personnage sans jamais déborder.",
    difficulte: "tout-petit",
  },
];

/**
 * Premier thème saisonnier. Il ne vaut que s'il est indexé avant les
 * recherches de décembre : sur ce site, une page met une à deux semaines à
 * entrer dans l'index.
 *
 * Le slug est la clé du dessin en base, tous thèmes confondus : d'où
 * « sapin-de-noel » plutôt que « sapin », qui prendrait la place d'un futur
 * sapin hors saison. « bonhomme-de-neige » fait exception : c'est l'expression
 * exacte qu'on tape, et un futur thème hiver prendrait le suffixe à sa place.
 */
const NOEL: Sujet[] = [
  {
    slug: "sapin-de-noel",
    nom: "un sapin de Noël décoré de boules et de guirlandes, une étoile au sommet, des paquets à son pied",
    titre: "Coloriage sapin de Noël à imprimer",
    intro:
      "Un sapin décoré de boules et de guirlandes, l'étoile au sommet et les paquets à son pied. Chaque boule est un petit rond fermé : on peut n'en colorier aucune pareille à sa voisine.",
    difficulte: "enfant",
    dessin:
      "L'étoile du sommet est taillée en facettes, comme un cristal. Une guirlande lumineuse fait le tour du sapin en plusieurs rangs d'ampoules ; entre elles pendent des boules à étoiles, à spirales ou à zigzags, des bonbons emballés et des sucres d'orge. Au pied, le tronc dépasse entre des paquets à rayures, à pois ou à étoiles, dont certains portent une étiquette.",
    colorier:
      "Le feuillage est la plus grande zone : un vert franc suffit, ou deux verts pour séparer les étages de branches. Le travail est dans les détails : chaque ampoule, chaque boule, chaque bonbon est une petite zone fermée qui demande un feutre fin. C'est pour cela qu'il est annoncé dès cinq ans. Une idée simple : du jaune pour toutes les ampoules, et une couleur différente pour chaque boule.",
    ideeNoel:
      "Les étiquettes des paquets sont vides : on peut y écrire les prénoms de la famille avant de colorier. Affiché sur la porte de la chambre début décembre, le sapin peut aussi se remplir petit à petit, une boule coloriée chaque soir, comme un calendrier de l'Avent fait main.",
  },
  {
    slug: "pere-noel",
    nom: "le Père Noël debout de face, barbe jusqu'à la ceinture, long manteau serré par une large ceinture, bonnet à pompon, sa hotte pleine de jouets sur l'épaule",
    titre: "Coloriage Père Noël à imprimer",
    intro:
      "Le Père Noël de face, la barbe sur la poitrine et, sur l'épaule, un sac d'où dépassent un ourson, un camion et des paquets. Le manteau se remplit en deux coups de feutre rouge ; la barbe, elle, se laisse blanche.",
    difficulte: "tout-petit",
    dessin:
      "Le Père Noël se tient debout, souriant, sur une simple ligne de sol. Sa barbe frisée lui couvre la poitrine, son bonnet se termine par un gros pompon, et son manteau est bordé de fourrure aux manches, en bas et sur le devant. Il porte des moufles, des bottes, et sur l'épaule un sac d'où dépassent un ourson, un camion et des paquets.",
    colorier:
      "Les traits sont épais et les zones grandes : manteau, pantalon, bottes, sac. C'est ce qui le rend accessible dès trois ans, avec des feutres larges ou des craies grasses. Rouge pour le manteau et le bonnet, noir pour la ceinture et les bottes, jaune pour la boucle ; la barbe et la fourrure restent blanches. Le visage, la boucle et les jouets du sac sont les petites zones, à colorier avec un grand.",
    ideeNoel:
      "Découpé en suivant son contour, il se colle sur la face d'un carton plié en deux : l'intérieur reste libre pour un mot aux grands-parents ou pour la liste de cadeaux adressée au Père Noël.",
  },
  {
    slug: "renne-de-noel",
    nom: "un renne de profil, grands bois ramifiés, un grelot au collier",
    titre: "Coloriage renne de Noël à imprimer",
    intro:
      "Un renne de profil, les bois ramifiés au-dessus de la tête et un grelot au collier. Les bois se divisent en branches fines : c'est la partie qui demande une main plus sûre.",
    difficulte: "enfant",
    dessin:
      "Le renne est debout, de profil, la tête tournée vers la gauche et le museau souriant. Ses bois s'ouvrent largement au-dessus de lui en branches recourbées. Un collier lui entoure le cou, avec un grelot pendu devant le poitrail, où le poil forme une touffe, et une sangle lui barre le flanc. Il se tient sur un peu d'herbe, la queue relevée.",
    colorier:
      "Le corps est une grande zone, coupée seulement par la sangle : un brun clair, plus foncé sur le dos, suffit. Les bois sont la partie délicate : longs et étroits, ils se divisent en pointes qu'il faut suivre sans déborder, d'où l'âge annoncé, dès cinq ans. Beige ou brun pour les bois, rouge pour le collier et la sangle, jaune pour le grelot, vert pour l'herbe. Et rien n'interdit de lui faire le nez rouge.",
    ideeNoel:
      "Plusieurs rennes coloriés chacun à sa façon, découpés et fixés sur une ficelle, font une guirlande pour la chambre ou la fenêtre. Au repas de Noël, une feuille posée sous l'assiette de chaque enfant devient un set de table à colorier en attendant le dessert.",
  },
  {
    slug: "bonhomme-de-neige",
    nom: "un bonhomme de neige en trois boules, écharpe, chapeau haut-de-forme, nez en carotte et bras en branches",
    titre: "Coloriage bonhomme de neige à imprimer",
    intro:
      "Un bonhomme de neige en trois boules, avec son écharpe, son chapeau et sa carotte en guise de nez. Presque tout reste blanc : l'enfant ne colorie que les accessoires, et le dessin est fini en dix minutes.",
    difficulte: "tout-petit",
    dessin:
      "Le bonhomme est fait de trois boules posées dans la neige, la plus grosse en bas. Il porte un chapeau haut-de-forme cerclé d'un ruban, une écharpe dont un pan retombe sur le ventre, et deux gros boutons. Ses yeux et sa bouche sont des ronds de charbon, son nez une carotte striée, et ses bras deux branches levées, comme s'il saluait.",
    colorier:
      "Les contours sont épais et très espacés : il n'y a presque rien à manquer, d'où l'âge annoncé, dès trois ans. Noir ou bleu nuit pour le chapeau, une couleur vive pour l'écharpe et le ruban, orange pour la carotte, marron pour les bras. Les boules peuvent rester blanches ou prendre une ombre bleu pâle sur les bords ; le fond vide se prête à un ciel bleu semé de flocons.",
    ideeNoel:
      "Colorié puis découpé, il se colle sur une vitre et se voit depuis la rue. Les plus petits peuvent aussi coller du coton sur les boules au lieu de les colorier : une neige qu'on touche.",
  },
  {
    slug: "cadeau-de-noel",
    nom: "trois paquets cadeaux empilés, du plus grand en bas au plus petit en haut, rubans et gros nœuds, un papier à rayures, un à pois, un à étoiles",
    titre: "Coloriage cadeau de Noël à imprimer",
    intro:
      "Trois paquets empilés, du plus grand au plus petit, chacun ceinturé d'un ruban, et un grand nœud au sommet. Le papier est laissé à motifs simples : rayures, pois, étoiles — une couleur par paquet suffit à les distinguer.",
    difficulte: "tout-petit",
    dessin:
      "Trois paquets empilés, du plus large en bas au plus petit en haut. Celui du bas est à rayures, celui du milieu à pois, celui du haut à étoiles. Chacun est ceinturé d'un ruban qui fait la croix sur le couvercle, mais seul le paquet du sommet porte un nœud, large, avec ses deux pans.",
    colorier:
      "Chaque paquet se lit tout seul : une couleur pour le papier, une autre pour le ruban, et le motif qui reste blanc ou prend une troisième teinte. Les pois et les étoiles sont assez grands pour être coloriés un à un par une petite main, d'où l'âge annoncé, dès trois ans ; les rayures du bas demandent un peu plus de soin. Pour un empilement qui se lit bien, alterner une couleur chaude et une froide : rouge, vert, rouge.",
    ideeNoel:
      "Le dessin se prête à une liste : on écrit sur chaque paquet le nom d'un cadeau rêvé, et la feuille part avec la lettre au Père Noël. Coloriée, elle sert aussi de papier d'emballage pour une petite boîte.",
  },
  {
    slug: "boule-de-noel",
    nom: "une grosse boule de Noël suspendue à une branche de sapin, couverte de bandes, de losanges et de flocons",
    titre: "Coloriage boule de Noël à imprimer",
    intro:
      "Une grosse boule suspendue à une branche de sapin, couverte de bandes, de losanges et de flocons. Chaque bande peut prendre sa couleur, et les flocons restent blancs pour trancher.",
    difficulte: "ado",
    dessin:
      "La boule est suspendue par un fil à une branche de sapin dont les aiguilles sont dessinées une à une, bourgeons compris. Son attache est striée en biais. Elle est découpée en bandes : des losanges en haut, des flocons et des points, une large frise de losanges ornés de feuillages, de nouveau des flocons, puis des arcs ; elle se termine en pointe par une petite clochette.",
    colorier:
      "C'est un coloriage de motifs, proche d'un mandala : beaucoup de petites zones fermées et régulières, qui se répètent d'une bande à l'autre. D'où l'âge annoncé, dès huit ans, avec des feutres fins ou des crayons bien taillés. Une méthode qui marche : choisir trois couleurs et les faire tourner d'une bande à l'autre, garder les flocons blancs, finir par la branche en deux verts. Les adultes s'y retrouvent aussi.",
    ideeNoel:
      "Coloriée et découpée selon son contour, la boule se suspend au sapin ou à une fenêtre par un fil passé dans l'anneau. Collée sur la face d'un carton plié, elle fait une carte de vœux.",
  },
  {
    slug: "bonnet-de-noel",
    nom: "un bonnet de Noël à pompon, bordure en fourrure, la pointe retombant sur le côté",
    titre: "Coloriage bonnet de Noël à imprimer",
    intro:
      "Un bonnet à pompon, la pointe qui retombe et la bordure en fourrure. Deux grandes zones et une petite : c'est le plus simple de la série, fait pour les plus jeunes.",
    difficulte: "tout-petit",
    dessin:
      "Un bonnet seul, sans personnage : une grande pointe molle qui retombe sur le côté, une bordure de fourrure toute en bosses et un gros pompon au bout. Deux traits suggèrent le pli du tissu. Il n'y a ni fond ni décor.",
    colorier:
      "Trois zones et des contours épais : la pointe, la bordure, le pompon. C'est le dessin le plus simple de la série, fait pour une première prise de feutre, dès trois ans. Rouge pour le bonnet, et la fourrure laissée blanche ou passée en gris très clair ; ceux qui aiment changer peuvent tenter un bonnet vert, ou à rayures.",
    ideeNoel:
      "Découpé selon son contour, le bonnet coiffe qui on veut : une photo imprimée, un dessin, un portrait de famille. Collé sur une bande de papier ajustée au tour de tête, il devient un chapeau de lutin pour le soir du réveillon.",
  },
  {
    slug: "traineau-du-pere-noel",
    nom: "le traîneau du Père Noël chargé de paquets empilés, caisse ornée de volutes, patins recourbés, glissant sur la neige",
    titre: "Coloriage traîneau du Père Noël à imprimer",
    intro:
      "Le traîneau chargé de cadeaux, les patins recourbés glissant sur la neige. Les volutes de la caisse et les paquets empilés font un dessin riche, à colorier en plusieurs séances.",
    difficulte: "enfant",
    dessin:
      "Le traîneau glisse de nuit dans un paysage de neige : un croissant de lune, des étoiles, des sapins enneigés sur les collines. Sa caisse en bois est couverte de volutes et d'une branche de houx ; une lanterne pend à l'avant, une petite boule de Noël sur le côté, et deux coussins attendent sur la banquette. Derrière s'entassent des paquets à étoiles, à rayures ou à pois, une boîte ronde et un sac ficelé, plein lui aussi. Les patins s'enroulent en spirales.",
    colorier:
      "Le dessin est dense : la caisse et les patins alternent grandes surfaces et volutes serrées, et chaque paquet a son ruban et son motif. Annoncé dès cinq ans, il se colorie par morceaux, ou à plusieurs, chacun sa zone. Rouge et or pour le traîneau, une couleur par paquet ; le ciel peut se foncer en bleu nuit en laissant la lune et les étoiles blanches.",
    ideeNoel:
      "Le dessin raconte la nuit de Noël : on peut le colorier pendant l'Avent, un morceau par jour, et l'afficher le soir du réveillon. Imprimé une fois par enfant, il fait aussi un set de table pour patienter pendant le repas.",
  },
  {
    slug: "lutin-de-noel",
    nom: "un lutin de Noël souriant, oreilles pointues, bonnet à grelot, col, ceinture et chaussons pointus, tenant un marteau devant un cheval de bois",
    titre: "Coloriage lutin de Noël à imprimer",
    intro:
      "Un lutin aux oreilles pointues, le marteau à la main devant un cheval de bois. Sa tenue est découpée en petites pièces — col, ceinture, chaussons — qui appellent chacune leur couleur.",
    difficulte: "enfant",
    dessin:
      "Un lutin souriant, aux oreilles pointues, tient un marteau à côté d'un cheval à bascule. Son bonnet est rayé, bordé de zigzags, et finit par un grelot. Il porte un col à pointes, une veste boutonnée, une large ceinture à boucle, un collant rayé et des chaussons pointus ornés de grelots. Le cheval a une selle, un étrier, une bride, une crinière et une robe à pois.",
    colorier:
      "Le lutin est découpé en petites pièces (bonnet, col, veste, ceinture, collant, chaussons) qui appellent chacune leur couleur : c'est ce qui le place dès cinq ans. Le vert et le rouge font la tenue classique ; le collant rayé peut alterner deux couleurs, bande par bande. Le cheval se colorie à part, en bois clair ou en blanc à pois, avec une selle rouge.",
    ideeNoel:
      "Le lutin et son cheval à bascule ouvrent sur l'atelier du Père Noël : de quoi raconter, en coloriant, comment les jouets se fabriquent avant Noël. Colorié, il peut accueillir les visiteurs sur la porte d'entrée pendant tout décembre.",
  },
  {
    slug: "buche-de-noel",
    nom: "une bûche de Noël sur un plat, écorce en crème striée, décorée de houx et de champignons en meringue",
    titre: "Coloriage bûche de Noël à imprimer",
    intro:
      "Une bûche sur son plat, l'écorce striée comme du bois et décorée de houx et de petits champignons. À colorier en chocolat, en marron glacé ou en framboise — selon celle qu'on mangera à Noël.",
    difficulte: "enfant",
    dessin:
      "Une bûche roulée, vue de biais sur un plat ovale. Sa tranche montre une spirale ; le dessus est strié comme une écorce, avec un nœud de bois. Elle est garnie de branches de houx aux baies rondes et de petits champignons. Le bord du plat est décoré de feuilles et de volutes.",
    colorier:
      "Les stries de l'écorce font de longues bandes étroites à suivre : c'est la partie qui demande de la précision, d'où l'âge annoncé, dès cinq ans. Le reste est plus large : la tranche, le plat, les feuilles de houx. Brun chocolat pour l'écorce, une teinte plus claire pour la spirale de la tranche, vert pour le houx, rouge pour les baies, blanc ou beige pour les champignons. Le plat peut prendre une couleur vive pour faire ressortir le gâteau.",
    ideeNoel:
      "Coloriée aux couleurs de la vraie bûche, elle annonce le dessert : posée sur la table, avec le nom du gâteau écrit au dos, elle sert de menu. Elle peut aussi faire la carte d'invitation d'un goûter de Noël.",
  },
  {
    slug: "couronne-de-noel",
    nom: "une couronne de Noël à suspendre à la porte, sans bougies, en branches de sapin aux aiguilles dessinées une à une, pommes de pin, baies de houx et un grand nœud en bas",
    titre: "Coloriage couronne de Noël à imprimer",
    intro:
      "Une couronne de branches de sapin, garnie de pommes de pin, de baies de houx et d'un grand nœud. Les aiguilles sont dessinées une à une : c'est le coloriage le plus long de la série, pour les grands.",
    difficulte: "ado",
    dessin:
      "Une couronne de branches de sapin, ouverte au centre, sans bougies. Les aiguilles sont dessinées une à une sur tout le tour. Des pommes de pin aux écailles détaillées et des feuilles de houx avec leurs baies sont réparties dans les branches. En bas, un grand nœud laisse retomber deux longs rubans.",
    colorier:
      "Les branches sont faites d'innombrables traits d'aiguilles serrés, qui demandent des crayons bien taillés et du temps, d'où l'âge annoncé, dès huit ans. Les adultes y trouvent aussi leur compte. Deux ou trois verts, du plus sombre au plus clair, donnent du relief aux branches ; brun pour les pommes de pin, vert foncé pour le houx, rouge pour les baies et le nœud.",
    ideeNoel:
      "Coloriée puis découpée, la couronne se suspend à la porte de la chambre ou de l'entrée, comme une vraie. Le cercle vide du centre est fait pour un message : « Joyeux Noël », le nom de la famille, ou une photo collée derrière l'ouverture.",
  },
  {
    slug: "chaussette-de-noel",
    nom: "une chaussette de Noël suspendue à la cheminée, large revers blanc uni laissé vide, un sucre d'orge et un ourson qui dépassent",
    titre: "Coloriage chaussette de Noël à imprimer",
    intro:
      "Une chaussette pendue à la cheminée, d'où dépassent un sucre d'orge et un ourson. Le revers est assez large pour y écrire son prénom avant de la colorier.",
    difficulte: "tout-petit",
    dessin:
      "La chaussette pend devant une cheminée en briques. Son revers est large, uni et laissé vide. Le reste est découpé en bandes : des étoiles et des points, puis des points seuls, avec la pointe et le talon à part. Un ourson et un sucre d'orge dépassent par le haut.",
    colorier:
      "Les traits sont épais, les zones grandes et bien fermées : un enfant de trois ans s'y retrouve. Rouge et blanc pour la chaussette, en alternant les bandes ; marron pour l'ourson, rouge et blanc en spirale pour le sucre d'orge ; les briques en orange ou en rouge brique. Le revers reste blanc pour y écrire.",
    ideeNoel:
      "Le revers vide attend un prénom : une chaussette par enfant, accrochée au manteau de la cheminée ou à la porte de la chambre, et chacun reconnaît la sienne le matin de Noël.",
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
  {
    slug: "dinosaures",
    nom: "Dinosaures",
    titre: "Coloriages de dinosaures à imprimer",
    description:
      "Des coloriages de dinosaures gratuits à imprimer en A4 : T-Rex, diplodocus, tricératops, stégosaure et une vingtaine d'autres. Du tout-petit au squelette de musée, contours nets et zones fermées.",
    excerpt:
      "Du T-Rex au bébé qui sort de l'œuf : vingt-deux dessins au trait, classés du plus simple au plus exigeant.",
    sujets: DINOSAURES,
  },
  {
    slug: "noel",
    nom: "Noël",
    titre: "Coloriages de Noël à imprimer",
    description:
      "Des coloriages de Noël gratuits à imprimer en A4 : sapin, Père Noël, renne, bonhomme de neige, bûche et chaussette. Du bonnet pour les tout-petits à la couronne pour les grands, contours nets et zones fermées.",
    excerpt:
      "Du sapin décoré au traîneau chargé de cadeaux : des dessins au trait pour patienter jusqu'au 25.",
    sujets: NOEL,
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
