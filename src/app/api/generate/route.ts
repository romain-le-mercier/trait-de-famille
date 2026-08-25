import { NextResponse } from "next/server";

/**
 * Moteur de rendu — c'est ici que le coloriage est produit.
 *
 * Deux fournisseurs possibles, choisis d'après les variables d'environnement
 * présentes : Replicate (prioritaire s'il est configuré) ou Gemini. Sans clé,
 * l'app n'a pas de moteur et le dit clairement à l'utilisateur.
 */

type Provider = "replicate" | "gemini" | null;

function detectProvider(): Provider {
  if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL) {
    return "replicate";
  }
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

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
  const provider = detectProvider();
  return NextResponse.json({ available: provider !== null, provider });
}

export async function POST(request: Request) {
  const provider = detectProvider();
  if (!provider) {
    return NextResponse.json(
      { message: "Aucun moteur IA n'est configuré." },
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
    const result =
      provider === "replicate"
        ? await runReplicate(bytes, photo.type || "image/jpeg", prompt)
        : await runGemini(bytes, photo.type || "image/jpeg", prompt);

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

async function runReplicate(
  bytes: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedImage> {
  const token = process.env.REPLICATE_API_TOKEN!;
  const model = process.env.REPLICATE_MODEL!; // ex. "owner/nom" ou "owner/nom:version"
  const [path, version] = model.split(":");
  const endpoint = version
    ? "https://api.replicate.com/v1/predictions"
    : `https://api.replicate.com/v1/models/${path}/predictions`;

  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      ...(version ? { version } : {}),
      input: { image: dataUrl, prompt },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate a répondu ${response.status}`);
  }

  let prediction = (await response.json()) as {
    status: string;
    output?: unknown;
    urls?: { get?: string };
    error?: string;
  };

  // Repli si "Prefer: wait" n'a pas suffi : on interroge jusqu'à 60 s.
  const pollUrl = prediction.urls?.get;
  for (let i = 0; i < 30 && pollUrl && ["starting", "processing"].includes(prediction.status); i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const poll = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    prediction = await poll.json();
  }

  if (prediction.status !== "succeeded") {
    throw new Error(prediction.error || `Rendu IA ${prediction.status}`);
  }

  const output = prediction.output;
  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output) && typeof output[0] === "string"
        ? output[0]
        : null;
  if (!url) throw new Error("Réponse Replicate inattendue");

  const image = await fetch(url);
  if (!image.ok) throw new Error("Image générée illisible");
  return {
    data: await image.arrayBuffer(),
    mimeType: image.headers.get("content-type") ?? "image/png",
  };
}

async function runGemini(
  bytes: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedImage> {
  const key = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-image";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: bytes.toString("base64") } },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini a répondu ${response.status} : ${detail.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    candidates?: {
      content?: {
        parts?: { inlineData?: { data?: string; mimeType?: string } }[];
      };
    }[];
  };

  const part = payload.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error("Gemini n'a pas renvoyé d'image");

  const buffer = Buffer.from(part.inlineData.data, "base64");
  return {
    data: buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
    mimeType: part.inlineData.mimeType ?? "image/png",
  };
}
