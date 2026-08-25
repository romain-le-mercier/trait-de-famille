import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide } from "@/lib/guides";

const guide = getGuide("anniversaire-enfant-coloriage")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

export default function Page() {
  return (
    <GuideArticle guide={guide}>
      <p>
        Un goûter d&apos;anniversaire suit toujours la même courbe : une heure
        d&apos;excitation croissante, un pic ingérable au moment du gâteau, et
        des parents qui arrivent au milieu du chaos. Ce qui sauve la fête,
        c&apos;est un temps calme placé au bon endroit. Le coloriage est le
        candidat évident — encore faut-il le préparer correctement.
      </p>

      <h2>Où le placer dans le déroulé</h2>
      <p>
        Pas au début : les enfants arrivent chargés d&apos;énergie et ne
        s&apos;assoiront pas. Pas à la fin non plus, ils sont trop fatigués. Le
        bon moment est <strong>juste après le gâteau</strong>, quand tout le
        monde est déjà assis et que le pic de sucre commence à retomber.
        Compte vingt à trente minutes de vrai calme, ce qui laisse largement le
        temps de ranger la cuisine.
      </p>

      <h2>Pourquoi le coloriage personnalisé change la donne</h2>
      <p>
        Un cahier de coloriage acheté occupe cinq minutes : les enfants
        feuillettent, gribouillent, passent à autre chose. Un dessin où ils se
        reconnaissent, en revanche, retient l&apos;attention — parce
        qu&apos;il y a un enjeu. Deux formules fonctionnent :
      </p>
      <ul>
        <li>
          <strong>Le portrait du roi de la fête.</strong> Une photo de
          l&apos;enfant dont c&apos;est l&apos;anniversaire, imprimée en autant
          d&apos;exemplaires qu&apos;il y a d&apos;invités. Chacun colorie sa
          version, et l&apos;enfant repart avec quinze portraits de lui — un
          souvenir bien plus fort qu&apos;un sachet de bonbons.
        </li>
        <li>
          <strong>La photo de groupe prise sur place.</strong> Plus ambitieux
          mais spectaculaire : photo au début du goûter, génération pendant le
          gâteau, impression et distribution dans la foulée. Il faut une
          imprimante à portée de main et un peu de sang-froid.
        </li>
      </ul>

      <h2>La liste de préparation</h2>
      <ol>
        <li>
          <strong>Une photo par coloriage</strong>, nette et prise de près. Les
          critères sont détaillés dans notre{" "}
          <Link
            href="/guides/quelle-photo-choisir"
            className="font-semibold text-grape underline decoration-2 underline-offset-2"
          >
            guide sur le choix de la photo
          </Link>
          .
        </li>
        <li>
          <strong>Un exemplaire par enfant, plus trois.</strong> Il y a toujours
          un petit frère qui s&apos;incruste, un dessin renversé dans le sirop,
          et un invité surprise.
        </li>
        <li>
          <strong>Du papier 120 g.</strong> Le papier ordinaire traverse aux
          feutres et gondole, et un dessin taché avant la fin décourage
          l&apos;enfant.
        </li>
        <li>
          <strong>Des crayons de couleur, pas des feutres.</strong> Moins de
          taches sur la table, moins de bouchons perdus, moins de conflits pour
          le rouge.
        </li>
        <li>
          <strong>Un niveau de détail adapté à l&apos;âge des invités</strong>,
          pas à celui du roi de la fête. À un anniversaire de quatre ans, prends
          le trait épais et les grandes zones.
        </li>
      </ol>

      <h2>Le détail qui fait la différence</h2>
      <p>
        Écris le prénom de chaque invité en haut de sa feuille avant de
        distribuer. Ça supprime les disputes de propriété, ça donne un rôle à
        chacun, et ça transforme le dessin en objet à rapporter chez soi. Les
        parents qui viennent chercher leur enfant repartent avec un souvenir de
        la fête — et l&apos;anniversaire dont on reparlera.
      </p>

      <h2>Et pour occuper le reste du mercredi ?</h2>
      <p>
        Si la fête se termine tôt et qu&apos;il reste une après-midi à tenir,{" "}
        <Link
          href="/guides/activites-enfants-jour-de-pluie"
          className="font-semibold text-grape underline decoration-2 underline-offset-2"
        >
          nos neuf activités pour les jours de pluie
        </Link>{" "}
        prennent le relais.
      </p>
    </GuideArticle>
  );
}
