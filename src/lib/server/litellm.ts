/**
 * Le seul endroit qui sait parler au moteur d'images.
 *
 * Tout passe par LiteLLM, un proxy devant le modèle : les appels, les jetons
 * et le coût sont journalisés au même endroit. Il n'y a volontairement aucun
 * fournisseur de secours — un appel direct échapperait à ces relevés, ce qui
 * viderait le proxy de son intérêt.
 *
 * On interroge le format OpenAI (`/v1/chat/completions`) et non la route de
 * pass-through Gemini : celle-ci attend un nom de modèle sans préfixe alors
 * que les clés sont autorisées sur `gemini/<modèle>`, et répond 403.
 * L'image générée revient dans `message.images[]`, sous forme d'URL `data:`.
 */

/** Au-delà, on considère que le moteur ne répondra pas. */
const TIMEOUT_MS = 120_000;

export interface GeneratedImage {
  data: ArrayBuffer;
  mimeType: string;
}

export function engineConfigured(): boolean {
  return Boolean(process.env.LITELLM_BASE_URL && process.env.LITELLM_API_KEY);
}

export interface ImageRequest {
  prompt: string;
  /** Image de départ, quand il s'agit d'en transformer une plutôt que d'en créer. */
  source?: { bytes: Buffer; mimeType: string };
}

export async function generateImage(request: ImageRequest): Promise<GeneratedImage> {
  const base = process.env.LITELLM_BASE_URL!.replace(/\/$/, "");
  const key = process.env.LITELLM_API_KEY!;
  const model = process.env.LITELLM_MODEL ?? "gemini/gemini-3.1-flash-image-preview";

  const content: unknown[] = [{ type: "text", text: request.prompt }];
  if (request.source) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${request.source.mimeType};base64,${request.source.bytes.toString("base64")}`,
      },
    });
  }

  const response = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      /**
       * Le cache du proxy doit rester à l'écart.
       *
       * LiteLLM indexe ses réponses sur le corps de la requête. Or nos
       * prompts sont déterministes : deux générations de suite pour le même
       * sujet, ou pour la même photo avec les mêmes réglages, envoient un
       * corps identique — et le proxy renvoie l'image précédente en quelques
       * centièmes de seconde.
       *
       * C'est exactement ce qu'il ne faut pas ici. « Générer une autre
       * version » et « Régénérer » n'ont de sens que s'ils redessinent : un
       * cache les rend silencieusement inopérants, et l'utilisateur croit le
       * bouton cassé. Aucun appel de cette application ne gagne à être mis en
       * cache, puisqu'on ne redemande jamais la même image sans vouloir
       * précisément qu'elle change.
       *
       * `no-store` évite en prime de remplir le cache du proxy de plusieurs
       * mégaoctets de base64 qui ne seront jamais relus.
       */
      cache: { "no-cache": true, "no-store": true },
    }),
  });

  if (!response.ok) {
    // Le corps d'erreur du proxy nomme le modèle et les droits de la clé : il
    // va dans les journaux du serveur, pas dans l'écran de l'utilisateur.
    console.error("[litellm]", response.status, await response.text());
    throw new Error("Le moteur n'a pas répondu. Réessaie dans un instant.");
  }

  const payload = (await response.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        images?: { image_url?: { url?: string }; url?: string }[];
      };
    }[];
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

/** Vrai si l'échec vient du réseau, et non d'une réponse du proxy. */
export function isNetworkError(error: unknown): boolean {
  const cause = (error as { cause?: NodeJS.ErrnoException } | undefined)?.cause;
  return Boolean(cause?.code);
}
