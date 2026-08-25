import { NextResponse } from "next/server";

/**
 * Moteur de rendu — c'est ici que le coloriage est produit.
 *
 * Une seule voie : LiteLLM, un proxy devant le modèle d'images. Aucun repli
 * n'est prévu, et c'est délibéré — un fournisseur de secours appelé en direct
 * échapperait à la journalisation des appels et du coût, qui est la raison
 * d'être du proxy. Si LiteLLM n'est pas configuré ou ne répond pas, l'app le
 * dit à l'utilisateur plutôt que de contourner.
 */

function engineConfigured(): boolean {
  return Boolean(process.env.LITELLM_BASE_URL && process.env.LITELLM_API_KEY);
}

/** Au-delà, on considère que le moteur ne répondra pas. */
const ENGINE_TIMEOUT_MS = 120_000;

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

  try {
    const bytes = Buffer.from(await photo.arrayBuffer());
    const mimeType = photo.type || "image/jpeg";
    const result = await runLiteLLM(bytes, mimeType, prompt);

    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[generate]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Le moteur IA n'a pas répondu.",
      },
      { status: 502 },
    );
  }
}

interface GeneratedImage {
  data: ArrayBuffer;
  mimeType: string;
}

/** Décode une image renvoyée sous forme d'URL `data:` en un buffer. */
function fromDataUri(uri: string): GeneratedImage | null {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(uri);
  if (!match) return null;
  const buffer = Buffer.from(match[2], "base64");
  return {
    data: buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
    mimeType: match[1],
  };
}

/**
 * Appel via LiteLLM, au format OpenAI `chat/completions`.
 *
 * LiteLLM n'accepte pas le format natif de Gemini pour ce modèle : sa route
 * de pass-through attend un nom de modèle sans préfixe, alors que les clés
 * sont autorisées sur `gemini/<modèle>`. On passe donc par le format OpenAI,
 * que le proxy traduit — et qui est de toute façon le seul chemin où l'usage
 * et le coût sont journalisés.
 *
 * L'image générée revient dans `message.images[]`, sous forme d'URL `data:`.
 */
async function runLiteLLM(
  bytes: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedImage> {
  const base = process.env.LITELLM_BASE_URL!.replace(/\/$/, "");
  const key = process.env.LITELLM_API_KEY!;
  const model = process.env.LITELLM_MODEL ?? "gemini/gemini-3.1-flash-image-preview";

  const response = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${bytes.toString("base64")}` },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    // Le corps d'erreur du proxy nomme le modèle et les droits de la clé :
    // il va dans les journaux du serveur, pas dans l'écran de l'utilisateur.
    console.error("[generate:litellm]", response.status, await response.text());
    throw new Error("Le moteur n'a pas répondu. Réessaie dans un instant.");
  }

  const payload = (await response.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        images?: { image_url?: { url?: string }; url?: string }[];
      };
    }[];
    usage?: { total_tokens?: number };
  };

  const message = payload.choices?.[0]?.message;
  const candidate =
    message?.images?.[0]?.image_url?.url ??
    message?.images?.[0]?.url ??
    (typeof message?.content === "string" && message.content.startsWith("data:")
      ? message.content
      : null);

  if (!candidate) throw new Error("LiteLLM n'a pas renvoyé d'image");
  const image = fromDataUri(candidate);
  if (!image) throw new Error("Image LiteLLM illisible");
  return image;
}
