import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getTheme, nomFichierImage } from "@/lib/coloriages/themes";
import { getGuide } from "@/lib/guides";
import { listerPublies } from "@/lib/server/coloriages";
import { absoluteUrl } from "@/lib/site";

const guide = getGuide("carte-de-noel-a-colorier")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

// Les vignettes et les liens dépendent des dessins publiés, lus en base à
// l'exécution : un dessin dépublié ne doit pas devenir un lien mort.
export const dynamic = "force-dynamic";

const lienTexte =
  "font-semibold text-grape underline decoration-2 underline-offset-2";

/** « Coloriage sapin de Noël à imprimer » → « Sapin de Noël ». */
function nomCourt(titre: string): string {
  const nom = titre.replace(/^Coloriage\s+/, "").replace(/\s+à imprimer$/, "");
  return nom.charAt(0).toUpperCase() + nom.slice(1);
}

export default async function Page() {
  // Base muette : l'erreur remonte (5xx), comme pour le hub et les fiches.
  const publies = new Map(
    (await listerPublies())
      .filter((d) => d.theme === "noel")
      .map((d) => [d.slug, d.mime]),
  );

  const cartes = (getTheme("noel")?.sujets ?? []).map((sujet) => {
    const mime = publies.get(sujet.slug);
    return {
      slug: sujet.slug,
      nom: nomCourt(sujet.titre),
      href: `/coloriages/noel/${sujet.slug}`,
      lie: mime !== undefined,
      image: mime ? `/coloriages/image/${nomFichierImage(sujet.slug, mime)}` : null,
    };
  });
  const liees = cartes.filter((carte) => carte.lie);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cartes de Noël à colorier",
    numberOfItems: liees.length,
    itemListElement: liees.map((carte, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: carte.nom,
      url: absoluteUrl(carte.href),
    })),
  };

  return (
    <GuideArticle guide={guide}>
      <p>
        Une carte de vœux que l&apos;enfant colorie lui-même vaut toutes les
        cartes du commerce, surtout pour des grands-parents. Chacun des douze
        coloriages de Noël du site existe en carte à plier : une feuille A4 en
        paysage, le dessin sur la moitié droite, qui devient la face une fois la
        feuille pliée en deux. Le dos et l&apos;intérieur restent blancs, pour
        écrire. C&apos;est gratuit, sans compte.
      </p>

      <h2>Imprimer la carte</h2>
      <ul>
        <li>
          <strong>Le bon bouton.</strong> Sur la fiche du dessin choisi, le
          bouton « Carte à plier (PDF) » donne la carte ; « Télécharger en PDF
          (A4) » donne le coloriage en pleine page, qui n&apos;est pas fait pour
          être plié.
        </li>
        <li>
          <strong>Format A4, à 100 %.</strong> Dans la fenêtre
          d&apos;impression, on garde le format A4 et l&apos;échelle à 100 %,
          sans « ajuster à la page » : sinon le milieu de la feuille ne tombe
          plus sur le trait de pliage.
        </li>
        <li>
          <strong>Un papier épais.</strong> Une carte tient debout à partir de
          160 g. Le papier d&apos;imprimante ordinaire (80 g) marche aussi, mais
          la carte reste molle et les feutres traversent : la feuille de 160 à
          200 g se trouve en papeterie et passe dans la plupart des
          imprimantes, par le bac manuel.
        </li>
      </ul>

      <h2>Plier</h2>
      <p>
        Un trait fin, en pointillés, marque le milieu de la feuille. On plie le
        long de ce trait, le dessin à l&apos;extérieur, et on marque le pli en
        passant le dos d&apos;une cuillère ou l&apos;ongle dessus : le papier
        épais se plie plus net ainsi. Le dessin se retrouve sur la face, le dos
        ne porte qu&apos;une petite ligne avec le nom du site, et
        l&apos;intérieur est vierge. On peut colorier avant ou après le
        pliage ; après, la carte posée à plat sur la table ne bouge plus.
      </p>

      <h2>Quoi écrire dedans</h2>
      <ul>
        <li>
          <strong>Avant 5 ans.</strong> L&apos;enfant ne sait pas encore écrire
          : il signe d&apos;un dessin, d&apos;une main tracée au crayon, ou de
          la première lettre de son prénom, et un adulte écrit le message à
          côté, sous sa dictée.
        </li>
        <li>
          <strong>De 5 à 7 ans.</strong> « Joyeux Noël » et son prénom, recopiés
          d&apos;après un modèle écrit au crayon par l&apos;adulte. Deux mots
          suffisent : c&apos;est l&apos;écriture qui compte.
        </li>
        <li>
          <strong>Après 7 ans.</strong> Une vraie lettre : ce qu&apos;on a
          fait cette année, ce qu&apos;on attend de Noël, une question pour
          celui qui la reçoit. Une carte postée à un grand-parent appelle
          souvent une réponse.
        </li>
      </ul>

      <h2>Les 12 cartes de Noël à colorier</h2>
      <p>
        Chaque dessin ouvre sa fiche, où se trouve le bouton « Carte à plier
        (PDF) ». Les plus simples conviennent dès 3 ans, les plus chargés aux
        grands enfants ; chaque fiche dit à partir de quel âge.
      </p>
      <ul className="!list-none !pl-0 grid gap-4 sm:grid-cols-3">
        {cartes.map((carte) => {
          const contenu = (
            <>
              {carte.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={carte.image}
                  alt={`${carte.nom} — carte de Noël à colorier`}
                  loading="lazy"
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 rounded-tile border-2 border-line bg-white object-contain"
                />
              )}
              <span className="font-display font-bold text-ink">{carte.nom}</span>
            </>
          );
          return (
            <li key={carte.slug} className="!mt-0">
              {carte.lie ? (
                <Link
                  href={carte.href}
                  className="flex flex-col items-start gap-2 hover:underline"
                >
                  {contenu}
                </Link>
              ) : (
                <div className="flex flex-col items-start gap-2">{contenu}</div>
              )}
            </li>
          );
        })}
      </ul>

      <h2>Et pour patienter jusqu&apos;au 25</h2>
      <p>
        Les mêmes dessins, et d&apos;autres, forment un{" "}
        <Link href="/guides/calendrier-de-l-avent-coloriage" className={lienTexte}>
          calendrier de l&apos;Avent à colorier
        </Link>
        , un dessin par soir du 1er au 24 décembre. Tous les coloriages de Noël
        sont aussi sur{" "}
        <Link href="/coloriages/noel" className={lienTexte}>
          la page des coloriages de Noël
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
