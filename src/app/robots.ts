import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Le tunnel d'achat (/apercu, /debloquer, /merci…) n'est pas bloqué ici mais
 * marqué `noindex` dans ses propres métadonnées : interdire l'exploration
 * empêcherait justement les moteurs de lire cette consigne.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
