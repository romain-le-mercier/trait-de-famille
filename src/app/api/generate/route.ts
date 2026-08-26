import { NextResponse } from "next/server";
import {
  engineConfigured,
  generateImage,
  isNetworkError,
} from "@/lib/server/litellm";

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

export async function GET() {
  return NextResponse.json({ available: engineConfigured() });
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

    // Cette ligne est la seule preuve, côté serveur, qu'une génération est
    // allée au bout. Si elle manque alors que le proxy a facturé l'appel,
    // c'est que la réponse n'a jamais quitté le conteneur.
    console.log(
      `[generate] ok en ${((Date.now() - startedAt) / 1000).toFixed(1)}s ` +
        `· envoi ${Math.round(bytes.length / 1024)} Ko ` +
        `· retour ${Math.round(result.data.byteLength / 1024)} Ko`,
    );

    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      `[generate] échec après ${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
      error,
    );
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
