import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getSujet, nomFichierImage } from "@/lib/coloriages/themes";
import { getGuide } from "@/lib/guides";
import { listerPublies } from "@/lib/server/coloriages";
import { absoluteUrl } from "@/lib/site";

const guide = getGuide("calendrier-de-l-avent-coloriage")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

// Les vignettes et les liens dépendent des dessins publiés, lus en base à
// l'exécution : un dessin dépublié ne doit pas devenir un lien mort.
export const dynamic = "force-dynamic";

/**
 * Les 24 jours, dans l'ordre. Chaque phrase ne dit que ce que montre le
 * dessin publié (relue contre `intro` et `dessin` de la fiche) : la page est la
 * même pour tout le monde, quel que soit le jour où on la lit.
 */
const JOURS: { theme: string; slug: string; phrase: string }[] = [
  {
    theme: "animaux",
    slug: "chat",
    phrase:
      "Le chat assis de face, la queue enroulée autour des pattes : de grandes zones bien fermées pour un premier soir sans difficulté.",
  },
  {
    theme: "noel",
    slug: "bonnet-de-noel",
    phrase:
      "Le bonnet seul, avec sa pointe molle, sa bordure en fourrure et son pompon : trois zones, que les plus petits colorient sans aide.",
  },
  {
    theme: "animaux",
    slug: "lapin",
    phrase:
      "Le lapin assis près de sa carotte : les grandes oreilles dressées et le ventre se remplissent vite, la carotte attend son orange.",
  },
  {
    theme: "animaux",
    slug: "herisson",
    phrase:
      "Le hérisson de profil, chaque piquant fermé par son trait : un soir pour apprendre à ne pas dépasser, piquant après piquant.",
  },
  {
    theme: "animaux",
    slug: "ecureuil",
    phrase:
      "L'écureuil assis, un gland entre les pattes : sa queue en panache occupe la moitié de la feuille et se colorie d'un seul geste, en roux ou en gris.",
  },
  {
    theme: "noel",
    slug: "bonhomme-de-neige",
    phrase:
      "Le bonhomme de neige en trois boules lève ses bras en branches : presque tout reste blanc, il n'y a que le chapeau, l'écharpe et la carotte à colorier.",
  },
  {
    theme: "animaux",
    slug: "pingouin",
    phrase:
      "Le manchot debout sur la banquise : le dos noir et le ventre blanc sont nettement séparés, un dessin qui se lit au premier coup d'œil.",
  },
  {
    theme: "animaux",
    slug: "chien",
    phrase:
      "Le chien assis, les oreilles tombantes et la langue sortie : quelques traits pour le poil, auquel on peut donner la couleur du chien de la famille.",
  },
  {
    theme: "animaux",
    slug: "renard",
    phrase:
      "Le renard assis, sa queue touffue ramenée devant lui : une silhouette simple, où deux tons de roux suffisent à faire ressortir le pelage.",
  },
  {
    theme: "noel",
    slug: "chaussette-de-noel",
    phrase:
      "La chaussette pendue devant la cheminée en briques, un ourson et un sucre d'orge qui dépassent : on écrit son prénom sur le revers vide avant de colorier.",
  },
  {
    theme: "animaux",
    slug: "hibou",
    phrase:
      "Le hibou perché, les yeux grands ouverts : les rangées régulières de plumes du poitrail se colorient une à une, en alternant deux bruns.",
  },
  {
    theme: "animaux",
    slug: "mouton",
    phrase:
      "Le mouton à la toison bouclée : les boucles couvrent tout le corps, un motif long et reposant pour un soir où l'on a le temps.",
  },
  {
    theme: "animaux",
    slug: "ours",
    phrase:
      "L'ours dressé sur ses pattes arrière au milieu de sa clairière : de grandes surfaces pour l'animal, de petites herbes autour pour ceux qui aiment les détails.",
  },
  {
    theme: "noel",
    slug: "boule-de-noel",
    phrase:
      "La grosse boule pendue à sa branche de sapin, découpée en bandes de losanges et de flocons : un coloriage de motifs pour les grands, qui se fait en deux soirs.",
  },
  {
    theme: "animaux",
    slug: "loup",
    phrase:
      "Le loup assis, la tête levée en plein hurlement : son pelage dessiné par mèches plaît aux plus grands, qui peuvent y passer plusieurs gris.",
  },
  {
    theme: "animaux",
    slug: "cheval",
    phrase:
      "Le cheval au galop, crinière au vent : chaque mèche de la crinière et de la queue est séparée et peut prendre son propre ton.",
  },
  {
    theme: "noel",
    slug: "couronne-de-noel",
    phrase:
      "La couronne de branches de sapin, aux aiguilles dessinées une à une, avec ses pommes de pin, son houx et son grand nœud : le dessin le plus long de la série.",
  },
  {
    theme: "noel",
    slug: "cadeau-de-noel",
    phrase:
      "Trois paquets empilés, à rayures, à pois et à étoiles, sous un grand nœud : on écrit sur chacun un cadeau rêvé avant de le colorier.",
  },
  {
    theme: "noel",
    slug: "renne-de-noel",
    phrase:
      "Le renne de profil, un grelot au collier et les bois largement ouverts : les branches fines des bois demandent une main sûre, et le nez peut finir en rouge.",
  },
  {
    theme: "noel",
    slug: "lutin-de-noel",
    phrase:
      "Le lutin aux oreilles pointues, marteau en main à côté de son cheval à bascule : de quoi raconter, en coloriant, l'atelier où se fabriquent les jouets.",
  },
  {
    theme: "noel",
    slug: "sapin-de-noel",
    phrase:
      "Le sapin décoré, l'étoile au sommet et les paquets à son pied : une couleur différente pour chaque boule, et les prénoms de la famille sur les étiquettes vides.",
  },
  {
    theme: "noel",
    slug: "buche-de-noel",
    phrase:
      "La bûche sur son plat, l'écorce striée, garnie de houx et de petits champignons : on la colorie aux couleurs de celle qu'on mangera à Noël.",
  },
  {
    theme: "noel",
    slug: "pere-noel",
    phrase:
      "Le Père Noël debout, la barbe sur la poitrine et le sac sur l'épaule, d'où dépassent un ourson, un camion et des paquets : le manteau rouge se remplit vite, la barbe reste blanche.",
  },
  {
    theme: "noel",
    slug: "traineau-du-pere-noel",
    phrase:
      "Le traîneau chargé de paquets glisse de nuit sous un croissant de lune, entre des sapins enneigés : le dessin de la nuit de Noël, qui se colorie volontiers en plusieurs morceaux.",
  },
];

const lienTexte =
  "font-semibold text-grape underline decoration-2 underline-offset-2";

export default async function Page() {
  // Base muette : l'erreur remonte (5xx), comme pour le hub et les fiches,
  // plutôt qu'une page dégradée qui lierait des fiches non vérifiées.
  const publies = new Map(
    (await listerPublies()).map((d) => [`${d.theme}/${d.slug}`, d.mime]),
  );

  const jours = JOURS.map((jour, i) => {
    const sujet = getSujet(jour.theme, jour.slug)!;
    const mime = publies.get(`${jour.theme}/${jour.slug}`);
    return {
      ...jour,
      numero: i + 1,
      date: `${i === 0 ? "1er" : i + 1} décembre`,
      titre: sujet.titre,
      href: `/coloriages/${jour.theme}/${jour.slug}`,
      lie: mime !== undefined,
      image: mime ? `/coloriages/image/${nomFichierImage(jour.slug, mime)}` : null,
    };
  });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Calendrier de l'Avent à colorier : 24 coloriages",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: jours.filter((jour) => jour.lie).length,
    itemListElement: jours
      .filter((jour) => jour.lie)
      .map((jour) => ({
        "@type": "ListItem",
        // Le numéro du jour, même si une fiche manque : le nom porte la date.
        position: jour.numero,
        name: `${jour.date} — ${jour.titre}`,
        url: absoluteUrl(jour.href),
      })),
  };

  return (
    <GuideArticle guide={guide}>
      <p>
        Un calendrier de l&apos;Avent n&apos;a pas besoin de chocolat pour
        tenir un enfant en haleine jusqu&apos;au 25 : un dessin par soir suffit.
        Voici vingt-quatre coloriages gratuits, un pour chaque jour du 1er au 24
        décembre. Ils commencent par des dessins simples, des animaux et un
        bonnet, et montent vers Noël : la couronne, le renne, le sapin, la
        bûche, le Père Noël, et le traîneau pour la dernière nuit.
      </p>

      <h2>Comment s&apos;en servir</h2>
      <ul>
        <li>
          <strong>Imprimer d&apos;avance.</strong> Chaque fiche donne un PDF A4
          gratuit, sans compte. Le plus simple est d&apos;imprimer les
          vingt-quatre fin novembre, à 100 %, sur un papier de 120 g si
          l&apos;on colorie aux feutres, puis d&apos;écrire le numéro du jour
          au dos de chaque feuille.
        </li>
        <li>
          <strong>Un dessin par soir.</strong> La feuille du jour sort de la
          pile après le dîner, comme on ouvre une case. Les premiers se font en
          dix minutes ; ceux de la troisième semaine demandent plus de temps et
          peuvent déborder sur le lendemain.
        </li>
        <li>
          <strong>L&apos;afficher.</strong> Chaque dessin fini rejoint les
          autres sur un mur, une porte ou une ficelle tendue avec des pinces à
          linge : le 24 au soir, la frise compte vingt-quatre dessins.
        </li>
      </ul>
      <p>
        Pour les plus petits, un parent peut garder les dessins chargés en
        détails (la boule, la couronne) pour lui : on colorie à deux, chacun sa
        feuille. Chaque fiche indique l&apos;âge à partir duquel son dessin se
        colorie seul.
      </p>

      <h2>Les 24 jours, du 1er au 24 décembre</h2>
      <ol className="!list-none !pl-0">
        {jours.map((jour) => {
          const contenu = (
            <>
              {jour.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={jour.image}
                  alt={jour.titre}
                  loading="lazy"
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 rounded-tile border-2 border-line bg-white object-contain"
                />
              )}
              <span className="font-display font-bold text-ink">
                {jour.date} — {jour.titre}
              </span>
            </>
          );
          return (
            <li key={jour.slug} className="mt-6">
              {jour.lie ? (
                <Link
                  href={jour.href}
                  className="flex items-center gap-4 hover:underline"
                >
                  {contenu}
                </Link>
              ) : (
                <div className="flex items-center gap-4">{contenu}</div>
              )}
              <p className="!mt-2">{jour.phrase}</p>
            </li>
          );
        })}
      </ol>

      <h2>Et après le 24 ?</h2>
      <p>
        Le traîneau fini, il reste les vacances. Un dessin fait d&apos;après une
        photo de la famille, à colorier ensemble, fait aussi un cadeau aux
        grands-parents :{" "}
        <Link href="/guides/cadeau-grands-parents" className={lienTexte}>
          l&apos;idée est détaillée ici
        </Link>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </GuideArticle>
  );
}
