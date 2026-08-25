import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">
        Politique de confidentialité
      </h1>
      <p>
        Trait de Famille traite des photos qui contiennent souvent des enfants.
        Cette page détaille ce qu&apos;il advient de ces images.
      </p>

      <h2>Tes photos</h2>
      <p>
        La photo que tu envoies sert uniquement à produire ton coloriage. La
        transformation est réalisée par un prestataire de génération
        d&apos;images.
      </p>
      <p>
        [à compléter avant mise en ligne : nom du prestataire, base légale,
        localisation du traitement, durée de conservation, engagement de
        non-réutilisation pour l&apos;entraînement de modèles, et sous-traitants
        éventuels.]
      </p>

      <h2>Tes coloriages et tes crédits</h2>
      <p>
        Les coloriages débloqués et le solde de crédits sont enregistrés dans le
        stockage local de ton navigateur. Ils disparaissent si tu vides les
        données du site. Télécharge les PDF que tu veux conserver.
      </p>

      <h2>Paiement</h2>
      <p>
        Les paiements sont traités par Stripe. Nous ne voyons ni ne stockons tes
        données bancaires. Stripe conserve les informations nécessaires à la
        transaction selon sa propre politique.
      </p>

      <h2>Mesure d&apos;audience</h2>
      <p>
        [à compléter : indiquer ici l&apos;outil de mesure utilisé, ou préciser
        qu&apos;aucun traceur n&apos;est déposé.]
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux demander l&apos;accès, la rectification ou l&apos;effacement des
        données te concernant à [à compléter : adresse de contact].
      </p>
      <p className="text-sm">
        Dernière mise à jour : [à compléter]. Responsable de traitement : [à
        compléter].
      </p>
    </>
  );
}
