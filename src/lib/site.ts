/**
 * Adresse publique du site. Sert de base aux URL canoniques, au sitemap et aux
 * images de partage — toutes doivent être absolues.
 *
 * En production, `NEXT_PUBLIC_SITE_URL` doit pointer sur le domaine réel :
 * sans ça, les balises canoniques et le sitemap renverraient vers localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Trait de Famille";

/** URL absolue à partir d'un chemin interne. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
