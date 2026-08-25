import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide } from "@/lib/guides";

const guide = getGuide("activites-enfants-jour-de-pluie")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
};

export default function Page() {
  return (
    <GuideArticle guide={guide}>
      <p>
        Il pleut, le parc est mort, et il reste quatre heures avant le dîner.
        Les listes d&apos;activités qu&apos;on trouve partout ont un défaut :
        elles proposent des ateliers qui demandent une heure de préparation et
        durent sept minutes. Voici neuf activités classées par ce qui compte
        vraiment — le rapport entre le temps de préparation et le temps de
        calme obtenu.
      </p>

      <h2>Préparation quasi nulle</h2>

      <h3>1. La chasse au trésor dans l&apos;appartement</h3>
      <p>
        Cache dix objets, donne une liste dessinée aux plus petits ou des
        devinettes aux plus grands. Compte cinq minutes de préparation pour
        vingt à trente minutes d&apos;occupation, et ça se relance à volonté en
        changeant les cachettes.
      </p>

      <h3>2. Le parcours de coussins</h3>
      <p>
        Tous les coussins de la maison au sol, interdiction de toucher le
        parquet. Défoulant, bruyant, et ça consomme l&apos;énergie physique qui
        rend les enfants insupportables les jours d&apos;enfermement. À faire en
        premier, pas en dernier.
      </p>

      <h3>3. Le dessin à quatre mains</h3>
      <p>
        Une feuille, deux personnes, chacun son tour ajoute un élément sans
        discuter. Fonctionne dès trois ans et jusqu&apos;à l&apos;âge adulte,
        pour peu que l&apos;adulte joue vraiment.
      </p>

      <h2>Dix minutes de préparation</h2>

      <h3>4. Le coloriage personnalisé</h3>
      <p>
        C&apos;est notre parti pris, alors autant l&apos;assumer : un coloriage
        où l&apos;enfant se reconnaît tient beaucoup plus longtemps qu&apos;un
        coloriage de licorne générique. Prends une photo de la famille,
        transforme-la en dessin au trait, imprime-la. Dix minutes montre en
        main, et une heure de table à dessin — parce que l&apos;enfant colorie
        son chien, sa maison, sa grand-mère.
      </p>
      <p>
        Adapte le niveau de détail à l&apos;âge : de grandes zones et un trait
        épais avant quatre ans, tous les détails du visage après huit. Le{" "}
        <Link
          href="/guides/quelle-photo-choisir"
          className="font-semibold text-grape underline decoration-2 underline-offset-2"
        >
          choix de la photo
        </Link>{" "}
        fait le reste.
      </p>

      <h3>5. La pâte à sel</h3>
      <p>
        Deux verres de farine, un de sel, un d&apos;eau. Ça se malaxe, ça se
        sculpte, ça cuit à four doux, et ça se peint le lendemain — donc ça
        occupe deux jours de pluie au lieu d&apos;un.
      </p>

      <h3>6. La cabane</h3>
      <p>
        Draps, chaises, pinces à linge. Le vrai truc : donner une lampe de poche
        et autoriser le goûter à l&apos;intérieur. La cabane passe alors de
        vingt minutes à toute l&apos;après-midi.
      </p>

      <h2>Pour les jours vraiment longs</h2>

      <h3>7. Le journal de la maison</h3>
      <p>
        Les enfants écrivent et illustrent un journal : la météo, ce que fait le
        chat, l&apos;interview d&apos;un parent. Une agrafeuse suffit. À partir
        de six ans, et ça peut tenir plusieurs jours.
      </p>

      <h3>8. Le film en stop-motion</h3>
      <p>
        Une application gratuite, des figurines, et beaucoup de patience. Trente
        secondes de film demandent une bonne heure — c&apos;est précisément
        l&apos;intérêt.
      </p>

      <h3>9. Le grand tri des jouets</h3>
      <p>
        Présenté comme une mission de tri pour donner aux autres enfants,
        ça devient une activité et non une corvée. Bonus : ça règle un problème
        de rangement que personne n&apos;affronte jamais.
      </p>

      <h2>Ce qui fait tenir une activité</h2>
      <p>
        Trois choses reviennent, quelle que soit l&apos;activité :
        l&apos;enfant y est personnellement impliqué, il n&apos;y a pas de
        bonne réponse, et le résultat existe encore le lendemain. C&apos;est
        exactement pour ça qu&apos;un coloriage à son effigie fonctionne mieux
        qu&apos;un cahier acheté en supermarché : ce n&apos;est pas un dessin de
        plus, c&apos;est le sien.
      </p>
    </GuideArticle>
  );
}
