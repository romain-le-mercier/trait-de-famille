import type { Metadata } from "next";
import { formatPrice, PACKS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "CGV",
  alternates: { canonical: "/cgv" },
};

export default function CgvPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">
        Conditions générales de vente
      </h1>
      <p>
        Ces conditions s&apos;appliquent à toute commande passée sur Trait de
        Famille. Vendeur : [à compléter].
      </p>

      <h2>Le service</h2>
      <p>
        Trait de Famille transforme une photo que tu fournis en dessin au trait à
        colorier. L&apos;aperçu est gratuit et filigrané. L&apos;achat débloque
        le fichier haute définition sans filigrane, au format PDF A4 et en PNG.
      </p>

      <h2>Prix et crédits</h2>
      <ul>
        {PACKS.map((pack) => (
          <li key={pack.id}>
            {pack.name} — {formatPrice(pack.amount)} ({pack.credits}{" "}
            {pack.credits > 1 ? "coloriages" : "coloriage"})
          </li>
        ))}
      </ul>
      <p>
        Les prix sont en euros, toutes taxes comprises. Un crédit débloque un
        coloriage. Les crédits n&apos;ont pas de date d&apos;expiration et sont
        rattachés au navigateur utilisé lors de l&apos;achat.
      </p>

      <h2>Paiement</h2>
      <p>
        Le paiement est traité par Stripe (carte bancaire, Apple&nbsp;Pay,
        Google&nbsp;Pay selon ton appareil). La commande est validée dès la
        confirmation du paiement.
      </p>

      <h2>Livraison</h2>
      <p>
        La livraison est immédiate et numérique : le fichier est téléchargeable
        dès le retour sur le site après paiement, puis depuis « Mes coloriages ».
      </p>

      <h2>Droit de rétractation</h2>
      <p>
        S&apos;agissant d&apos;un contenu numérique fourni immédiatement, tu
        renonces à ton droit de rétractation dès le téléchargement, conformément
        à l&apos;article L221-28 du Code de la consommation. L&apos;aperçu
        gratuit est là pour que tu voies le résultat avant de payer.
      </p>

      <h2>Réclamation</h2>
      <p>
        Un rendu qui ne convient pas ? Écris à [à compléter : adresse de
        contact], on regarde au cas par cas.
      </p>
    </>
  );
}
