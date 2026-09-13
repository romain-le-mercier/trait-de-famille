import { NextResponse } from "next/server";
import { debiterPourDeblocage } from "@/lib/server/accounts";
import { parId, reclamer } from "@/lib/server/oeuvres";
import { lire } from "@/lib/server/stockage";
import { identifier } from "@/lib/server/visiteur";

/**
 * Dépense un crédit et livre le coloriage sans filigrane.
 *
 * C'est le seul chemin par lequel un original quitte le serveur. Tout l'ordre
 * des opérations est là pour qu'on ne puisse ni payer sans recevoir, ni
 * recevoir sans payer :
 *
 *   1. le fichier est lu **avant** toute écriture — s'il manque, personne n'est
 *      débité ;
 *   2. le marquage « payée » et le débit du crédit se font dans **une seule
 *      transaction** (`debiterPourDeblocage`). Deux requêtes simultanées ne
 *      peuvent donc pas se croiser sur un état provisoire : la seconde attend
 *      le verrou, puis lit un état définitif ;
 *   3. le fichier n'est livré que sur une œuvre réellement payée — par cet
 *      appel, ou par un appel précédent.
 *
 * Une œuvre déjà débloquée est reservie sans second débit : la route doit
 * pouvoir être rappelée — rechargement, changement d'appareil, second
 * téléchargement — sans facturer deux fois.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  /**
   * `identifier` signe le jeton de visiteur avec `AUTH_SECRET` et lève si elle
   * manque. Même garde que dans `/api/generate` : un serveur mal configuré doit
   * le dire, pas renvoyer un 500 nu sur le chemin qui débite de l'argent.
   */
  let visiteur;
  try {
    visiteur = await identifier();
  } catch (error) {
    console.error("[oeuvres] identité visiteur impossible", error);
    return NextResponse.json(
      { message: "Le serveur n'est pas configuré pour livrer les coloriages." },
      { status: 501 },
    );
  }

  if (!visiteur.compteId) {
    return NextResponse.json(
      { message: "Connecte-toi pour débloquer ton coloriage." },
      { status: 401 },
    );
  }

  const oeuvre = await parId(id);
  if (!oeuvre) {
    return NextResponse.json({ message: "Ce coloriage n'existe plus." }, { status: 404 });
  }

  /**
   * Le dessin a pu être produit avant la connexion : c'est le cas normal, et
   * même le parcours qu'on a voulu. On le rattache alors au compte, à la
   * condition stricte qu'il ait appartenu au jeton anonyme du navigateur
   * courant — sans quoi n'importe qui réclamerait le dessin d'un autre.
   */
  const proprietaireCompte = `compte:${visiteur.compteId}`;
  if (oeuvre.proprietaire !== proprietaireCompte) {
    const reclame = await reclamer(id, visiteur.jetonAnonyme, visiteur.compteId);
    if (!reclame) {
      // Volontairement 404 et non 403 : ne pas révéler qu'un identifiant
      // existe mais appartient à quelqu'un d'autre.
      return NextResponse.json({ message: "Ce coloriage n'existe plus." }, { status: 404 });
    }
  }

  const fichier = await lire(id);
  if (!fichier) {
    console.error("[oeuvres] fichier manquant pour", id);
    return NextResponse.json(
      { message: "Le fichier de ce coloriage est introuvable. Aucun crédit n'a été utilisé." },
      { status: 410 },
    );
  }

  let deblocage;
  try {
    deblocage = await debiterPourDeblocage(
      { id: visiteur.compteId, email: null, name: null },
      id,
    );
  } catch (error) {
    /**
     * La transaction a été annulée : ni marquage, ni débit. Ne rien affirmer de
     * plus que ça — le seul cas indécidable est la perte de la connexion au
     * moment du COMMIT, et il vaut mieux inviter à vérifier le solde que
     * promettre un crédit intact qu'on n'a pas vérifié.
     */
    console.error("[oeuvres] déblocage impossible", id, error);
    return NextResponse.json(
      { message: "Le déblocage a échoué. Vérifie ton solde avant de réessayer." },
      { status: 500 },
    );
  }

  if (deblocage.etat === "disparue") {
    // La purge des essais expirés est passée entre la lecture du fichier et la
    // transaction. Le fichier est encore en mémoire ici : ne pas le livrer.
    console.error("[oeuvres] œuvre effacée pendant le déblocage", id);
    return NextResponse.json(
      { message: "Ce coloriage a expiré. Aucun crédit n'a été utilisé." },
      { status: 410 },
    );
  }

  if (deblocage.etat === "sans-credit") {
    return NextResponse.json(
      { message: "Tu n'as plus de crédit.", credits: deblocage.credits },
      { status: 402 },
    );
  }

  // Les deux issues qui livrent sont journalisées : celle qui vient d'être
  // payée, et celle qu'on ressert. Sans cette trace, un déblocage rejoué mille
  // fois serait indiscernable d'un déblocage unique.
  console.log(
    `[oeuvres] ${id} livrée · ${deblocage.etat === "paye" ? "payée à l'instant" : "déjà payée"}`,
  );

  return new NextResponse(new Uint8Array(fichier), {
    headers: {
      "Content-Type": oeuvre.mime,
      "Cache-Control": "private, no-store",
      "X-Oeuvre-Largeur": String(oeuvre.largeur),
      "X-Oeuvre-Hauteur": String(oeuvre.hauteur),
    },
  });
}
