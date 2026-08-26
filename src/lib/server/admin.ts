import { auth } from "@/auth";

/**
 * Qui a le droit d'entrer dans l'administration.
 *
 * L'admin déclenche des appels facturés au modèle et publie sur le site
 * public : il est **fermé par défaut**. Sans `ADMIN_EMAILS`, personne ne
 * passe — y compris le premier compte créé, y compris en développement. Une
 * porte qui s'ouvre toute seule quand la configuration manque est une porte
 * ouverte en production le jour où la variable saute.
 */

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function adminConfigured(): boolean {
  return allowlist().length > 0;
}

export interface AdminSession {
  email: string;
  name: string | null;
}

/** La session si elle est autorisée, `null` sinon. Ne dit jamais pourquoi. */
export async function getAdmin(): Promise<AdminSession | null> {
  const autorises = allowlist();
  if (autorises.length === 0) return null;

  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !autorises.includes(email)) return null;

  return { email, name: session?.user?.name ?? null };
}
