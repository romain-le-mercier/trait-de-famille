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
import type { DetailLevel } from "@/lib/lineart/types";
import { listerPublies } from "@/lib/server/coloriages";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const NIVEAUX: DetailLevel[] = ["tout-petit", "enfant", "ado"];

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ theme: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const theme = getTheme((await params).theme);
  if (!theme) return {};

  // Partagée, la page montre un de ses propres dessins plutôt que l'avant/après
  // générique du site : le premier sujet publié, dans l'ordre éditorial.
  const publies = new Map(
    (await listerPublies(theme.slug)).map((dessin) => [dessin.slug, dessin]),
  );
  const vitrine = theme.sujets.find((sujet) => publies.has(sujet.slug));
  const dessin = vitrine && publies.get(vitrine.slug)!;
  const images =
    vitrine && dessin
      ? [
          {
            url: absoluteUrl(
              `/coloriages/image/${nomFichierImage(vitrine.slug, dessin.mime)}`,
            ),
            width: dessin.largeur,
            height: dessin.hauteur,
            alt: `${vitrine.titre} — dessin au trait à colorier`,
          },
        ]
      : undefined;

  return {
    title: theme.titre,
    description: theme.description,
    alternates: { canonical: `/coloriages/${theme.slug}` },
    // Ces deux blocs remplacent ceux du layout racine au lieu de s'y fondre :
    // ce qu'ils doivent garder de lui est donc répété ici.
    openGraph: {
      title: theme.titre,
      description: theme.description,
      images,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: theme.titre,
      description: theme.description,
      images,
    },
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

  const guide = theme.guide;
  const parAge = guide
    ? NIVEAUX.map((niveau) => ({
        niveau,
        texte: guide.parAge[niveau],
        sujets: sujets.filter((sujet) => sujet.difficulte === niveau),
      })).filter((groupe) => groupe.sujets.length > 0)
    : [];

  // Même liste que la grille : Google lit dans le JSON-LD exactement les
  // dessins que la page montre. Il va avec le texte du hub : les thèmes sans
  // guide restent tels quels tant que le gabarit n'a pas fait ses preuves.
  const jsonLd = guide && {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: theme.titre,
    description: theme.description,
    url: absoluteUrl(`/coloriages/${theme.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sujets.length,
      itemListElement: sujets.map((sujet, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: sujet.titre,
        url: absoluteUrl(`/coloriages/${theme.slug}/${sujet.slug}`),
        image: absoluteUrl(`/coloriages/image/${sujet.fichier}`),
      })),
    },
  };

  return (
    <div className="mx-auto max-w-6xl">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-1 text-sm text-muted">
        <Link href="/coloriages" className="font-semibold hover:text-grape">
          Coloriages
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        <span className="font-semibold text-ink">{theme.nom}</span>
      </nav>

      <SectionTitle
        as="h1"
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

      {guide && (
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <section className="md:col-span-2">
            <h2 className="font-display text-2xl font-bold">
              Quel coloriage pour quel âge ?
            </h2>
            <div className="mt-5 grid gap-8 md:grid-cols-3">
              {parAge.map(({ niveau, texte, sujets: groupe }) => (
                <div key={niveau}>
                  <h3 className="font-display text-xl font-bold">
                    {ageConseille(niveau)}
                  </h3>
                  <p className="mt-2 text-muted">{texte}</p>
                  <ul className="mt-3 space-y-1">
                    {groupe.map((sujet) => (
                      <li key={sujet.slug}>
                        <Link
                          href={`/coloriages/${theme.slug}/${sujet.slug}`}
                          className="font-semibold text-grape hover:underline"
                        >
                          {sujet.titre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Imprimer</h2>
            <p className="mt-2 text-muted">{guide.imprimer}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">{guide.idees.titre}</h2>
            <ul className="mt-2 space-y-2 text-muted">
              {guide.idees.idees.map((idee) => (
                <li key={idee}>· {idee}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <div className="mt-12">
        <EtSiCetaitToi />
      </div>
    </div>
  );
}
