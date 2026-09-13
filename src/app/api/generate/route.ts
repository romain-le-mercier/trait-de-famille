import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { construireApercu } from "@/lib/server/filigrane";
import {
  engineConfigured,
  generateImage,
  isNetworkError,
} from "@/lib/server/litellm";
import { creer, purgerParfois as purgerOeuvresParfois } from "@/lib/server/oeuvres";
import {
  cleVisiteur,
  consommer,
  plafondPour,
  purgerParfois,
  rendre,
  restant,
} from "@/lib/server/quotas";
import { ecrire, supprimer as supprimerFichier } from "@/lib/server/stockage";
import { identifier } from "@/lib/server/visiteur";

/**
 * Moteur de rendu — c'est ici que le coloriage personnalisé est produit.
 *
 * Le dialogue avec le proxy vit dans `src/lib/server/litellm.ts`, partagé avec
 * la bibliothèque de coloriages gratuits. Ce fichier ne garde que ce qui lui
 * est propre : les prompts de conversion d'une photo.
 */

const PROMPTS = {
  base:
    "Convertis cette photo en page de coloriage : uniquement des contours noirs " +
    "nets sur fond blanc pur, aucun aplat gris, aucune ombre, aucune trame. " +
    "Toutes les zones doivent être fermées pour pouvoir être coloriées. " +
    "Garde la ressemblance des visages et la composition d'origine.",
  detail: {
    "tout-petit": "Simplifie fortement : grandes zones fermées, très peu de détails.",
    enfant: "Niveau de détail moyen, zones bien fermées et faciles à colorier.",
    ado: "Conserve les détails fins des visages et des cheveux.",
  } as Record<string, string>,
  stroke: {
    fin: "Trait fin et régulier.",
    moyen: "Trait d'épaisseur moyenne.",
    epais: "Trait épais et bien lisible.",
  } as Record<string, string>,
  removeBackground:
    "Supprime entièrement le décor et l'arrière-plan : ne garde que les " +
    "personnages (et les animaux) détourés, posés sur un fond blanc totalement " +
    "vide, sans sol, sans ombre portée, sans élément de mobilier ni de paysage.",
};

/**
 * État du moteur, et ce qu'il reste d'aperçus gratuits au visiteur.
 *
 * `restant: null` signifie « aucun garde en place » — soit le développement
 * local, soit une base injoignable. Le rendre visible ici est délibéré : c'est
 * ce qui permet de constater depuis l'extérieur que le quota est bien actif en
 * production, au lieu de l'espérer.
 */
export async function GET(request: Request) {
  const session = await auth();
  const cle = cleVisiteur(request, session?.user?.id);
  const plafond = plafondPour(Boolean(session?.user?.id));

  let libres: number | null = null;
  if (cle) {
    try {
      libres = await restant(cle, plafond);
    } catch (error) {
      console.error("[quota] lecture impossible", error);
    }
  }

  return NextResponse.json({
    available: engineConfigured(),
    restant: libres,
    plafond,
  });
}

export async function POST(request: Request) {
  if (!engineConfigured()) {
    return NextResponse.json(
      { message: "Le moteur de génération n'est pas configuré sur ce serveur." },
      { status: 501 },
    );
  }

  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  if (!(photo instanceof Blob)) {
    return NextResponse.json({ message: "Photo manquante." }, { status: 400 });
  }

  /**
   * `identifier` pose au besoin le cookie de visiteur : sans propriétaire,
   * l'œuvre rangée sur le volume ne pourrait être réclamée par personne.
   *
   * Il signe ce jeton avec `AUTH_SECRET` et lève si elle manque. Le try est là
   * pour que ce soit dit : depuis que l'aperçu range un fichier, `AUTH_SECRET`
   * ne conditionne plus seulement la connexion Google, elle conditionne
   * l'entonnoir gratuit entier. Sans ce garde, un serveur mal configuré
   * renverrait un 500 nu à chaque visiteur qui n'a pas encore de cookie.
   */
  let visiteur;
  try {
    visiteur = await identifier();
  } catch (error) {
    console.error("[generate] identité visiteur impossible", error);
    return NextResponse.json(
      { message: "Le serveur n'est pas configuré pour produire des coloriages." },
      { status: 501 },
    );
  }
  const connecte = Boolean(visiteur.compteId);

  // Le décompte passe avant l'appel au modèle — c'est tout l'intérêt — mais
  // après la validation de la photo : une requête malformée ne coûte rien et
  // ne doit donc rien consommer.
  const cle = cleVisiteur(request, visiteur.compteId);
  const plafond = plafondPour(connecte);

  if (cle) {
    try {
      const decompte = await consommer(cle, plafond);
      if (!decompte.autorise) {
        return NextResponse.json(
          {
            message: connecte
              ? `Tu as atteint la limite de ${plafond} aperçus pour aujourd'hui. Reviens demain — tes coloriages restent dans ta galerie.`
              : `Tu as utilisé tes ${plafond} aperçus gratuits du jour. Connecte-toi pour en avoir plus, ou débloque un coloriage : il reste dans ta galerie, sans être redessiné.`,
            quota: true,
          },
          { status: 429 },
        );
      }
      void purgerParfois();
    } catch (error) {
      // Base injoignable : on laisse passer. Un client qui a payé ne doit pas
      // être bloqué par une panne d'infrastructure, et le garde ne protège
      // qu'un budget — pas une donnée.
      console.error("[quota] décompte impossible, requête laissée passer", error);
    }
  }

  const detail = String(form?.get("detail") ?? "enfant");
  const stroke = String(form?.get("stroke") ?? "moyen");
  const removeBackground = String(form?.get("removeBackground") ?? "") === "1";
  const prompt = [
    PROMPTS.base,
    PROMPTS.detail[detail] ?? "",
    PROMPTS.stroke[stroke] ?? "",
    removeBackground ? PROMPTS.removeBackground : "",
  ]
    .filter(Boolean)
    .join(" ");

  const startedAt = Date.now();
  try {
    const bytes = Buffer.from(await photo.arrayBuffer());
    const mimeType = photo.type || "image/jpeg";
    const result = await generateImage({
      prompt,
      source: { bytes, mimeType },
    });

    /**
     * L'original ne quitte pas le serveur.
     *
     * Le fichier d'abord, l'enregistrement ensuite : si la base bronche, on
     * efface le fichier plutôt que de laisser un orphelin que rien ne
     * purgera. L'inverse — une ligne sans fichier — promettrait un coloriage
     * qu'on ne peut plus livrer.
     */
    const original = Buffer.from(result.data);
    const oeuvreId = randomUUID().replace(/-/g, "");
    await ecrire(oeuvreId, original);
    try {
      await creer({
        id: oeuvreId,
        proprietaire: visiteur.proprietaire,
        mime: result.mimeType,
        largeur: result.largeur,
        hauteur: result.hauteur,
        octets: original.byteLength,
        nomFichier: String(form?.get("fileName") ?? "") || null,
        empreintePhoto: String(form?.get("photoKey") ?? "") || null,
        reglages: { detail, stroke, removeBackground },
      });
    } catch (error) {
      await supprimerFichier(oeuvreId).catch(() => {});
      throw error;
    }

    const apercu = await construireApercu(original);

    // Cette ligne est la seule preuve, côté serveur, qu'une génération est
    // allée au bout. Si elle manque alors que le proxy a facturé l'appel,
    // c'est que la réponse n'a jamais quitté le conteneur.
    console.log(
      `[generate] ok en ${((Date.now() - startedAt) / 1000).toFixed(1)}s ` +
        `· envoi ${Math.round(bytes.length / 1024)} Ko ` +
        `· original ${Math.round(original.byteLength / 1024)} Ko ` +
        `${result.largeur}×${result.hauteur} ` +
        `· aperçu ${Math.round(apercu.data.byteLength / 1024)} Ko ` +
        `· œuvre ${oeuvreId}`,
    );

    void purgerOeuvresParfois();

    return new NextResponse(new Uint8Array(apercu.data), {
      headers: {
        "Content-Type": apercu.mimeType,
        "Cache-Control": "no-store",
        "X-Oeuvre": oeuvreId,
      },
    });
  } catch (error) {
    console.error(
      `[generate] échec après ${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
      error,
    );
    // Le modèle n'a rien rendu : le visiteur ne perd pas son tour.
    if (cle) await rendre(cle).catch(() => {});
    // « fetch failed » ne veut rien dire pour un visiteur, et le code réseau
    // sous-jacent (EAI_AGAIN, ECONNREFUSED…) est une information
    // d'infrastructure : elle reste dans les journaux.
    return NextResponse.json(
      {
        message: isNetworkError(error)
          ? "Le moteur de génération est injoignable. Réessaie dans un instant."
          : error instanceof Error
            ? error.message
            : "Le moteur n'a pas répondu.",
      },
      { status: 502 },
    );
  }
}
