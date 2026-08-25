import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

/** Seules les pages indexables y figurent : landing, guides, pages légales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const guides = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const legal = [
    "/mentions-legales",
    "/cgv",
    "/confidentialite",
    "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/creer`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/guides`, changeFrequency: "monthly", priority: 0.7 },
    ...guides,
    ...legal,
  ];
}
