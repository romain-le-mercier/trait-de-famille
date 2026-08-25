import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide } from "@/lib/guides";

const guide = getGuide("cadeau-grands-parents")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

export default function Page() {
  return (
    <GuideArticle guide={guide}>
      <p>
        Le cadeau pour les grands-parents est un problème connu : ils ont déjà
        tout, ils ne veulent rien, et le énième foulard finit dans un tiroir. Ce
        qui les touche, c&apos;est ce qui parle de leurs petits-enfants et qui
        porte une trace de travail — pas de dépense.
      </p>
      <p>
        D&apos;où l&apos;idée : transformer une photo des enfants en dessin au
        trait, le faire colorier par les enfants eux-mêmes, et l&apos;offrir. Le
        cadeau coûte quelques euros, prend une soirée, et il est
        rigoureusement unique.
      </p>

      <h2>Pourquoi ça fonctionne</h2>
      <ul>
        <li>
          <strong>C&apos;est fait main sans être bâclé.</strong> Le trait est
          propre, mais les couleurs sont celles de l&apos;enfant. On voit
          immédiatement qui l&apos;a fait.
        </li>
        <li>
          <strong>Ça s&apos;expose.</strong> Un dessin encadré trouve sa place
          dans un couloir ou sur un frigo, contrairement à un objet de plus.
        </li>
        <li>
          <strong>C&apos;est daté.</strong> Dans dix ans, il dira l&apos;âge
          qu&apos;avaient les enfants — ce qu&apos;aucun cadeau acheté ne fait.
        </li>
      </ul>

      <h2>Comment s&apos;y prendre, concrètement</h2>
      <ol>
        <li>
          <strong>Choisis une photo des enfants seuls</strong>, nette et prise
          de près. Les grands-parents veulent voir les visages, pas le paysage.
          Notre{" "}
          <Link
            href="/guides/quelle-photo-choisir"
            className="font-semibold text-grape underline decoration-2 underline-offset-2"
          >
            guide sur le choix de la photo
          </Link>{" "}
          détaille les critères.
        </li>
        <li>
          <strong>Génère le coloriage et imprime-le sur du papier épais</strong>{" "}
          (120 g minimum). Le papier ordinaire gondole aux feutres et le rendu
          final s&apos;en ressent beaucoup.
        </li>
        <li>
          <strong>Fais colorier l&apos;enfant sans le guider.</strong> Un ciel
          violet et un chien vert valent mieux qu&apos;un coloriage propre fait
          sous surveillance : c&apos;est la maladresse qui émeut.
        </li>
        <li>
          <strong>Fais-lui signer et dater au dos.</strong> C&apos;est le détail
          qui transforme le dessin en document de famille.
        </li>
        <li>
          <strong>Encadre.</strong> Un cadre A4 en grande surface coûte moins de
          dix euros et change complètement le statut de l&apos;objet : on
          n&apos;offre plus un dessin, on offre un tableau.
        </li>
      </ol>

      <h2>Les variantes qui marchent bien</h2>
      <ul>
        <li>
          <strong>Un exemplaire par petit-enfant.</strong> Chacun colorie le
          même dessin à sa façon ; le triptyque encadré côte à côte fait son
          effet.
        </li>
        <li>
          <strong>Le portrait avec l&apos;animal de la maison.</strong> Les
          chiens et les chats donnent d&apos;excellents traits, et ils comptent
          souvent autant que le reste de la famille.
        </li>
        <li>
          <strong>La photo ancienne rejouée.</strong> Transforme une photo des
          grands-parents jeunes : l&apos;effet de surprise est considérable.
        </li>
        <li>
          <strong>Le calendrier.</strong> Douze coloriages, un par mois, à faire
          au fil de l&apos;année. C&apos;est le cadeau de Noël qui dure douze
          mois.
        </li>
      </ul>

      <h2>Quand l&apos;offrir</h2>
      <p>
        Les occasions évidentes sont Noël, la fête des mères et la fête des
        pères, et la fête des grands-mères début mars. Mais ce cadeau a une
        particularité : il fonctionne encore mieux sans occasion. Un dessin
        envoyé un mardi de novembre, sans raison, a un effet
        disproportionné — parce que personne ne l&apos;attendait.
      </p>

      <h2>Le budget</h2>
      <p>
        Un coloriage, une feuille de papier épais, un cadre : on est à une
        dizaine d&apos;euros tout compris pour un cadeau qui sera gardé. À
        comparer avec ce qu&apos;on dépense habituellement pour un objet qui ne
        servira pas.
      </p>
    </GuideArticle>
  );
}
