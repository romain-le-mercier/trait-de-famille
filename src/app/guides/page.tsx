import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { dateFormat, guidesByDate } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Comment transformer une photo en coloriage, quelle photo choisir, et quoi en faire : nos guides pratiques pour les parents et les grands-parents.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <SectionTitle
        eyebrow="Guides"
        title="Coloriages, photos et jours de pluie."
        subtitle="Des conseils courts et testés, écrits pour les parents pressés."
      />

      <ul className="grid gap-5 sm:grid-cols-2">
        {guidesByDate().map((guide) => (
          <Card as="li" key={guide.slug} className="p-0">
            <Link
              href={`/guides/${guide.slug}`}
              className="flex h-full flex-col p-6 transition-colors hover:bg-paper"
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                {dateFormat.format(new Date(guide.updated))} ·{" "}
                {guide.readingMinutes} min
              </p>
              <h2 className="mt-2 font-display text-xl font-bold">
                {guide.heading}
              </h2>
              <p className="mt-2 flex-1 text-sm text-muted">{guide.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-grape">
                Lire le guide
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </span>
            </Link>
          </Card>
        ))}
      </ul>
    </div>
  );
}
