import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide } from "@/lib/guides";

const guide = getGuide("transformer-une-photo-en-coloriage")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

export default function Page() {
  return (
    <GuideArticle guide={guide}>
      <p>
        Transformer une photo en coloriage, c&apos;est demander à une image de
        perdre 99 % de son information — les couleurs, les ombres, les textures
        — pour ne garder que les contours. Le tout en restant reconnaissable, et
        surtout coloriable : des zones fermées, assez grandes pour qu&apos;un
        feutre y tienne. Trois familles d&apos;outils s&apos;y essaient, avec des
        résultats très inégaux.
      </p>

      <h2>1. Les filtres « contours » gratuits</h2>
      <p>
        Ce sont les convertisseurs en ligne, les filtres « croquis » des
        applications photo, ou le classique passage en niveaux de gris suivi
        d&apos;une détection de contours. Techniquement, l&apos;image est
        analysée pixel par pixel : là où la luminosité change brutalement, on
        trace une ligne.
      </p>
      <p>
        C&apos;est immédiat et gratuit. Le problème, c&apos;est que ces
        algorithmes ne savent pas ce qu&apos;ils regardent. Une chevelure
        bouclée, un pull en laine ou un feuillage produisent des milliers de
        micro-contrastes : le filtre les trace tous et tu obtiens un
        griffonnage gris illisible. À l&apos;inverse, un visage doucement
        éclairé n&apos;a presque aucun contraste franc, et le nez ou le menton
        disparaissent purement et simplement.
      </p>
      <p>
        <strong>Le verdict :</strong> utilisable sur des sujets très graphiques
        — une silhouette sur ciel clair, un objet détouré. Décevant sur des
        visages, c&apos;est-à-dire dans le seul cas qui t&apos;intéresse
        probablement.
      </p>

      <h2>2. Le détourage à la main</h2>
      <p>
        Dans Photoshop, Procreate, Krita ou Inkscape, on importe la photo sur un
        calque, on baisse son opacité, et on redessine par-dessus. C&apos;est la
        méthode qui donne les plus beaux résultats, parce qu&apos;un humain
        décide de ce qui compte : il garde la mèche qui caractérise le visage et
        jette les trois cents autres.
      </p>
      <p>
        C&apos;est aussi la plus coûteuse. Compte une à trois heures par
        portrait quand on sait dessiner, et une tablette graphique pour que le
        trait ne tremble pas. Sur une plateforme de freelances, un portrait au
        trait se commande généralement entre trente et cent euros selon le
        nombre de personnages — un prix parfaitement justifié, mais qui exclut
        l&apos;usage courant.
      </p>

      <h2>3. La génération automatique</h2>
      <p>
        Les modèles d&apos;image récents ne détectent plus des contrastes : ils
        interprètent la scène. Ils identifient un visage, comprennent où
        s&apos;arrête une joue, et redessinent la scène en trait continu — en
        simplifiant les cheveux plutôt qu&apos;en les hachurant, en fermant les
        zones pour qu&apos;elles se remplissent proprement.
      </p>
      <p>
        C&apos;est cette approche que nous utilisons. Concrètement : tu
        déposes une photo, le dessin apparaît en une trentaine de secondes, et
        tu peux régler l&apos;épaisseur du trait et le niveau de détail
        selon l&apos;âge de l&apos;enfant qui coloriera. Un tout-petit a besoin
        de grandes zones et d&apos;un trait épais ; un ado veut retrouver les
        détails du visage.
      </p>
      <p>
        La limite est réelle et vaut d&apos;être dite : le modèle réinterprète.
        Il ne décalque pas. Sur un portrait net, la ressemblance est frappante ;
        sur une photo de groupe prise de loin, les visages lointains deviennent
        approximatifs. D&apos;où l&apos;importance du choix de la photo de
        départ — c&apos;est le sujet de{" "}
        <Link
          href="/guides/quelle-photo-choisir"
          className="font-semibold text-grape underline decoration-2 underline-offset-2"
        >
          notre guide sur le choix de la photo
        </Link>
        .
      </p>

      <h2>Et pour l&apos;impression ?</h2>
      <p>
        Quelle que soit la méthode, deux détails font la différence entre un
        fichier et un coloriage utilisable :
      </p>
      <ul>
        <li>
          <strong>Le format.</strong> Un PDF A4 s&apos;imprime tel quel sur
          n&apos;importe quelle imprimante domestique. Une image JPEG, elle, sera
          redimensionnée par le pilote d&apos;impression, souvent avec des marges
          inattendues.
        </li>
        <li>
          <strong>Le papier.</strong> Le papier d&apos;imprimante ordinaire
          (80 g) gondole dès qu&apos;on utilise des feutres. Un 120 g coûte
          quelques euros la ramette et change complètement l&apos;expérience,
          surtout si le dessin finit sur le frigo.
        </li>
      </ul>

      <h2>Ce qu&apos;il faut retenir</h2>
      <ol>
        <li>
          Les filtres gratuits conviennent aux images très contrastées, pas aux
          visages.
        </li>
        <li>
          Le détourage manuel reste supérieur, mais coûte des heures ou des
          dizaines d&apos;euros par dessin.
        </li>
        <li>
          La génération automatique tient le milieu : quelques secondes, un
          résultat propre, à condition de partir d&apos;une photo nette.
        </li>
      </ol>
    </GuideArticle>
  );
}
