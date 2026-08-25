import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide } from "@/lib/guides";

const guide = getGuide("quelle-photo-choisir")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

export default function Page() {
  return (
    <GuideArticle guide={guide}>
      <p>
        Le coloriage ne peut pas inventer ce que la photo ne montre pas. Si le
        visage est flou, le dessin sera flou ; s&apos;il est dans l&apos;ombre,
        il sera vide. Cinq minutes passées à choisir la bonne photo valent plus
        que n&apos;importe quel réglage ensuite. Voici ce qui compte, par ordre
        d&apos;importance réelle.
      </p>

      <h2>1. La netteté du visage, avant tout</h2>
      <p>
        C&apos;est le seul critère éliminatoire. Zoome sur le visage à
        l&apos;écran : si tu distingues les cils et la bordure de l&apos;iris,
        c&apos;est bon. Si le visage devient une bouillie dès que tu agrandis,
        aucun outil ne rattrapera ça — les contours du nez et de la bouche
        n&apos;existent tout simplement pas dans le fichier.
      </p>
      <p>
        Méfie-toi en particulier des photos récupérées dans une conversation
        WhatsApp : elles sont recompressées et perdent une grande partie de leur
        définition. Va chercher l&apos;originale dans la pellicule.
      </p>

      <h2>2. La lumière</h2>
      <p>
        La meilleure lumière est celle d&apos;une fenêtre, de côté, un jour
        couvert. Elle éclaire uniformément et laisse juste assez de relief pour
        que les traits se dessinent.
      </p>
      <p>Les trois lumières qui posent problème :</p>
      <ul>
        <li>
          <strong>Le contre-jour.</strong> Sujet devant une fenêtre ou un
          coucher de soleil : le visage devient une silhouette sombre, sans
          aucun détail à extraire.
        </li>
        <li>
          <strong>Le plein soleil de midi.</strong> Il creuse des ombres dures
          sous les yeux et le nez, qui se transforment en taches noires dans le
          dessin.
        </li>
        <li>
          <strong>Le flash direct.</strong> Il écrase tout le relief : le visage
          devient plat, et le trait n&apos;a plus rien à quoi s&apos;accrocher.
        </li>
      </ul>

      <h2>3. La taille du sujet dans l&apos;image</h2>
      <p>
        Une règle simple : le visage doit occuper au moins un dixième de la
        hauteur de la photo. En dessous, il n&apos;y a plus assez de pixels pour
        que les traits soient fidèles, et la ressemblance se perd.
      </p>
      <p>
        C&apos;est le piège classique des photos de vacances : toute la famille
        devant un paysage magnifique, mais chaque visage fait quarante pixels de
        haut. Le paysage sera superbe en coloriage, les têtes seront génériques.
        Si c&apos;est cette photo que tu tiens à utiliser, recadre serré sur le
        groupe avant de générer — l&apos;outil de recadrage est fait pour ça.
      </p>

      <h2>4. Le nombre de personnes</h2>
      <p>
        Une à quatre personnes, c&apos;est l&apos;idéal. Au-delà, chacune occupe
        moins de place, donc moins de détail, et le résultat vire au dessin de
        groupe anonyme. Pour une photo de classe ou de grande tablée, mieux vaut
        faire plusieurs coloriages par sous-groupes.
      </p>

      <h2>5. L&apos;arrière-plan</h2>
      <p>
        Un fond chargé — une bibliothèque, un marché, une haie touffue — produit
        des dizaines de zones à colorier qui volent la vedette aux visages. Deux
        solutions : recadrer plus serré, ou cocher{" "}
        <strong>« Effacer le décor »</strong>, qui détoure les personnages et
        les pose sur un fond blanc. Cette dernière option est particulièrement
        efficace pour les tout-petits, qui se perdent dans un dessin trop dense.
      </p>
      <p>
        À l&apos;inverse, un décor qui raconte quelque chose — le sapin de Noël,
        le vélo, le chien — mérite d&apos;être gardé : c&apos;est souvent lui qui
        fait sourire des années plus tard.
      </p>

      <h2>6. Les cas particuliers</h2>
      <ul>
        <li>
          <strong>Les lunettes.</strong> Aucun problème, sauf si un reflet blanc
          masque complètement les yeux.
        </li>
        <li>
          <strong>Les animaux.</strong> Ils marchent très bien, souvent mieux
          que les humains : le pelage donne un trait vivant. Attention aux
          animaux très sombres, où l&apos;œil se confond avec le reste.
        </li>
        <li>
          <strong>Les photos anciennes scannées.</strong> Elles fonctionnent, à
          condition que le grain reste raisonnable. Un scan à 300 dpi minimum.
        </li>
        <li>
          <strong>Les captures d&apos;écran de vidéo.</strong> Presque toujours
          décevantes : le flou de mouvement est invisible à l&apos;œil mais
          fatal pour le trait.
        </li>
      </ul>

      <h2>En résumé</h2>
      <p>
        Une photo prise près du sujet, dans une lumière douce, avec un visage
        net et un fond calme donnera un beau coloriage à tous les coups. Si tu
        hésites entre deux photos, essaie les deux : l&apos;aperçu est gratuit,
        et le résultat tranche souvent en une seconde. Pour comprendre ce qui se
        passe entre la photo et le dessin, va voir{" "}
        <Link
          href="/guides/transformer-une-photo-en-coloriage"
          className="font-semibold text-grape underline decoration-2 underline-offset-2"
        >
          comment on transforme une photo en coloriage
        </Link>
        .
      </p>
    </GuideArticle>
  );
}
