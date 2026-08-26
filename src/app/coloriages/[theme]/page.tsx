import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Badge, Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { EtSiCetaitToi } from "@/components/coloriages/EtSiCetaitToi";
import {
  ageConseille,
  getTheme,
  nomFichierImage,

} from "@/lib/coloriages/themes";
import { listerPublies } from "@/lib/server/coloriages";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ theme: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const theme = getTheme((await params).theme);
  if (!theme) return {};
  return {
    title: theme.titre,
    description: theme.description,
    alternates: { canonical: `/coloriages/${theme.slug}` },
  };
}

export default async function ThemePage({ params }: Params) {
  const theme = getTheme((await params).theme);
  if (!theme) notFound();

  const publies = new Map(
    (await listerPublies(theme.slug)).map((dessin) => [dessin.slug, dessin.mime]),
  );
  const sujets = theme.sujets
    .filter((sujet) => publies.has(sujet.slug))
    .map((sujet) => ({
      ...sujet,
      fichier: nomFichierImage(sujet.slug, publies.get(sujet.slug)!),
    }));
  if (sujets.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-1 text-sm text-muted">
        <Link href="/coloriages" className="font-semibold hover:text-grape">
          Coloriages
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        <span className="font-semibold text-ink">{theme.nom}</span>
      </nav>

      <SectionTitle
        eyebrow="Gratuit"
        title={theme.titre}
        subtitle={theme.description}
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sujets.map((sujet) => (
          <Card as="li" key={sujet.slug} className="p-0">
            <Link
              href={`/coloriages/${theme.slug}/${sujet.slug}`}
              className="flex h-full flex-col p-4 transition-colors hover:bg-paper"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/coloriages/image/${sujet.fichier}`}
                alt={sujet.titre}
                loading="lazy"
                className="aspect-square w-full rounded-tile border-2 border-line bg-white object-contain"
              />
              <h2 className="mt-3 font-display font-bold">{sujet.titre}</h2>
              <div className="mt-2">
                <Badge tone="ink">{ageConseille(sujet.difficulte)}</Badge>
              </div>
            </Link>
          </Card>
        ))}
      </ul>

      <div className="mt-12">
        <EtSiCetaitToi />
      </div>
    </div>
  );
}
