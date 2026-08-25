import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Examples } from "@/components/marketing/Examples";
import { Faq, FAQ_ITEMS } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { Trust } from "@/components/marketing/Trust";
import { UseCases } from "@/components/marketing/UseCases";
import { PACKS } from "@/lib/pricing";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

/**
 * Le produit et ses trois packs. Les prix viennent de `PACKS`, comme la grille
 * tarifaire affichée : une seule source, pas de balisage qui dérive.
 */
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: SITE_NAME,
  description:
    "Transformation d'une photo en dessin au trait à colorier, livré en PDF A4 haute définition.",
  brand: { "@type": "Brand", name: SITE_NAME },
  image: absoluteUrl("/exemples/jardin-chien-trait.jpg"),
  offers: PACKS.map((pack) => ({
    "@type": "Offer",
    name: pack.name,
    price: (pack.amount / 100).toFixed(2),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: absoluteUrl("/debloquer"),
  })),
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Examples />
        <UseCases />
        <Pricing />
        <Trust />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div>
  );
}
