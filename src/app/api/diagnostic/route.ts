import { lookup } from "node:dns/promises";
import { NextResponse } from "next/server";

/**
 * TEMPORAIRE — sonde de réseau, pour trouver depuis quel nom et quel port le
 * conteneur applicatif joint LiteLLM. À supprimer une fois la configuration
 * arrêtée (voir « À compléter avant mise en production » dans le README).
 *
 * Deux garde-fous : la route n'existe que si `DIAGNOSTIC_TOKEN` est définie,
 * et elle exige ce jeton en paramètre. Sans la variable, elle répond 404 comme
 * si le fichier n'était pas là — retirer la variable suffit à la désactiver.
 *
 * Elle ne renvoie jamais la clé du proxy : seulement si l'authentification a
 * été acceptée.
 *
 * Les essais sont **séquentiels**, et le nom court n'est résolu qu'une fois.
 * Une résolution DNS qui échoue prend plusieurs secondes et monopolise un
 * thread de libuv : quatre en parallèle suffisent à saturer le pool par
 * défaut et à faire échouer par famine la seule adresse qui répond.
 */

const PORTS = [4000, 8000, 80];
const TIMEOUT_MS = 5000;

interface Probe {
  url: string;
  dns?: string;
  status?: number;
  ok?: boolean;
  detail?: string;
  ms?: number;
}

/** Extrait le nom d'hôte court d'une URL Coolify `<nom>.<ip>.sslip.io`. */
function shortName(hostname: string): string | null {
  const sansSslip = hostname.replace(/\.\d+\.\d+\.\d+\.\d+\.sslip\.io$/, "");
  return sansSslip !== hostname ? sansSslip : null;
}

function errorCode(error: unknown): string {
  const cause = (error as { cause?: NodeJS.ErrnoException } | undefined)?.cause;
  return cause?.code ?? (error as Error).message;
}

async function probe(base: string): Promise<Probe> {
  const result: Probe = { url: base };

  // On résout avant de connecter : c'est le code DNS qui distingue « réseau
  // Docker non partagé » (EAI_AGAIN, ENOTFOUND) d'un simple mauvais port.
  // Sans ça, le délai d'abandon masque la vraie cause.
  try {
    result.dns = (await lookup(new URL(base).hostname)).address;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    result.dns = `échec (${code ?? "inconnu"})`;
    result.detail =
      code === "EAI_AGAIN" || code === "ENOTFOUND"
        ? "nom inconnu du DNS — les conteneurs ne partagent pas de réseau"
        : "résolution impossible";
    return result;
  }

  const started = Date.now();
  try {
    const response = await fetch(`${base}/health/liveliness`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    result.ms = Date.now() - started;
    result.status = response.status;
    result.ok = response.ok;
    result.detail = (await response.text()).slice(0, 120);
  } catch (error) {
    result.ms = Date.now() - started;
    result.detail = errorCode(error);
  }
  return result;
}

/** Vérifie que la clé est acceptée, sans jamais la divulguer. */
async function checkKey(base: string): Promise<Probe> {
  const key = process.env.LITELLM_API_KEY;
  const result: Probe = { url: `${base}/v1/models` };
  if (!key) {
    result.detail = "LITELLM_API_KEY absente";
    return result;
  }
  const started = Date.now();
  try {
    const response = await fetch(`${base}/v1/models`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    result.ms = Date.now() - started;
    result.status = response.status;
    result.ok = response.ok;
    if (response.ok) {
      const payload = (await response.json()) as { data?: { id: string }[] };
      const modeles = payload.data?.map((m) => m.id) ?? [];
      const voulu = process.env.LITELLM_MODEL ?? "";
      result.detail = modeles.includes(voulu)
        ? `${modeles.length} modèle(s), dont celui configuré`
        : `le modèle configuré est ABSENT : ${modeles.join(", ")}`;
    } else {
      result.detail = (await response.text()).slice(0, 200);
    }
  } catch (error) {
    result.ms = Date.now() - started;
    result.detail = errorCode(error);
  }
  return result;
}

export async function GET(request: Request) {
  const attendu = process.env.DIAGNOSTIC_TOKEN;
  if (!attendu) return new NextResponse("Not found", { status: 404 });

  const url = new URL(request.url);
  if (url.searchParams.get("token") !== attendu) {
    return new NextResponse("Not found", { status: 404 });
  }

  const configured = process.env.LITELLM_BASE_URL?.replace(/\/$/, "");
  const demande = url.searchParams.get("url")?.replace(/\/$/, "");
  const sondes: Probe[] = [];
  let dns: string | undefined;

  if (demande) {
    // Essai unique et rapide, pour tester un nom au hasard depuis le
    // navigateur sans redéployer à chaque tentative.
    sondes.push(await probe(demande));
  } else {
    if (configured) sondes.push(await probe(configured));

    const court = configured
      ? (() => {
          try {
            return shortName(new URL(configured).hostname);
          } catch {
            return null;
          }
        })()
      : null;

    // Si le nom court est inconnu du DNS de Docker, inutile de dérouler les
    // ports : c'est la résolution qui manque, pas le port.
    if (court && !sondes.some((s) => s.ok)) {
      for (const port of PORTS) {
        const resultat = await probe(`http://${court}:${port}`);
        sondes.push(resultat);
        dns = resultat.dns;
        if (resultat.ok || resultat.dns?.startsWith("échec")) break;
      }
    }
  }

  const joignable = sondes.find((s) => s.ok);

  return NextResponse.json(
    {
      configure: configured ?? "(absente)",
      modele: process.env.LITELLM_MODEL ?? "(absent)",
      nomCourt: dns ? { resolution: dns } : undefined,
      sondes,
      cle: joignable ? await checkKey(joignable.url) : null,
      conclusion: joignable
        ? `Utilise LITELLM_BASE_URL=${joignable.url}`
        : dns?.startsWith("échec")
          ? "Le nom court n'est pas résolu : les deux conteneurs ne partagent pas de réseau Docker. " +
            "Récupère le vrai nom de conteneur (docker ps) et réessaie avec ?url=http://NOM:4000"
          : "Aucune URL joignable. Essaie un autre nom avec ?url=http://NOM:PORT",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
