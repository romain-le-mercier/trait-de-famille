import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";

/**
 * À qui appartient un coloriage.
 *
 * L'aperçu se fait sans compte — c'est tout l'entonnoir — mais le fichier vit
 * désormais sur le serveur, et un fichier sans propriétaire ne se protège pas.
 * D'où ce second identifiant, purement technique : un jeton signé, posé en
 * cookie, qui ne dit rien de la personne et ne sert qu'à retrouver ses essais.
 *
 * Il est signé avec `AUTH_SECRET` pour la même raison qu'un jeton de session :
 * sans signature, n'importe qui réclamerait les essais d'un autre en changeant
 * un cookie.
 */

const COOKIE = "tdf_visiteur";
const UN_AN = 60 * 60 * 24 * 365;

export interface Visiteur {
  /** `compte:<sub Google>` si connecté, `anon:<jeton>` sinon. */
  proprietaire: string;
  compteId: string | null;
  /** Toujours présent : il sert à réclamer les essais faits avant connexion. */
  jetonAnonyme: string;
}

function signer(jeton: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET est absente : impossible de signer le jeton visiteur.");
  return createHmac("sha256", secret).update(jeton).digest("base64url");
}

function verifier(valeur: string | undefined): string | null {
  if (!valeur) return null;
  const separateur = valeur.lastIndexOf(".");
  if (separateur < 1) return null;
  const jeton = valeur.slice(0, separateur);
  const signature = valeur.slice(separateur + 1);

  let attendue: string;
  try {
    attendue = signer(jeton);
  } catch {
    return null;
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(attendue);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return jeton;
}

/**
 * Lit le jeton, ou en pose un neuf.
 *
 * À n'appeler que depuis un gestionnaire de route : Next n'autorise l'écriture
 * de cookies que là.
 */
export async function identifier(): Promise<Visiteur> {
  const boite = await cookies();
  let jeton = verifier(boite.get(COOKIE)?.value);

  if (!jeton) {
    jeton = randomUUID();
    boite.set(COOKIE, `${jeton}.${signer(jeton)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: UN_AN,
    });
  }

  const session = await auth();
  const compteId = session?.user?.id ?? null;

  return {
    proprietaire: compteId ? `compte:${compteId}` : `anon:${jeton}`,
    compteId,
    jetonAnonyme: jeton,
  };
}
