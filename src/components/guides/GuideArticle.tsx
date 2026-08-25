import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { dateFormat, type Guide } from "@/lib/guides";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * Habillage commun des guides : titre, date de révision, styles de texte,
 * balisage `Article` et appel à l'action final. Chaque page n'écrit que son
 * contenu.
 */
export function GuideArticle({
  guide,
  children,
}: {
  guide: Guide;
  children: ReactNode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    inLanguage: "fr-FR",
    mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-grape underline decoration-2 underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Tous les guides
        </Link>
      </div>

      <article
        className="mx-auto mt-6 max-w-2xl [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_li]:text-muted [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:mt-4 [&_p]:text-muted [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
      >
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {guide.heading}
        </h1>
        <p className="mt-3 text-sm font-semibold text-muted">
          Mis à jour le {dateFormat.format(new Date(guide.updated))} ·{" "}
          {guide.readingMinutes} min de lecture
        </p>

        {children}

        <aside className="mt-12 rounded-card border-2 border-ink bg-paper p-6 text-center">
          <p className="font-display text-xl font-bold">
            Envie d&apos;essayer avec ta photo ?
          </p>
          <p className="mt-2 text-muted">
            L&apos;aperçu est gratuit : tu vois le dessin avant de décider.
          </p>
          <ButtonLink href="/creer" size="lg" className="mt-5">
            <Palette className="h-5 w-5" strokeWidth={2.2} />
            Créer mon coloriage
          </ButtonLink>
        </aside>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
