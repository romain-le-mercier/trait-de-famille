import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Printer } from "lucide-react";
import { Badge, Card } from "@/components/ui/Card";
import { EtSiCetaitToi } from "@/components/coloriages/EtSiCetaitToi";
import { TelechargerColoriage } from "@/components/coloriages/TelechargerColoriage";
import {
  ageConseille,
  getSujet,
  getTheme,
  nomFichierImage,
} from "@/lib/coloriages/themes";
import { getColoriage, listerPublies } from "@/lib/server/coloriages";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ theme: string; slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { theme: themeSlug, slug } = await params;
  const sujet = getSujet(themeSlug, slug);
  if (!sujet) return {};

  const dessin = await getColoriage(slug);
  const image =
    dessin?.statut === "publie"
      ? [absoluteUrl(`/coloriages/image/${nomFichierImage(slug, dessin.mime)}`)]
      : undefined;

  return {
    title: sujet.titre,
    description: sujet.intro,
    alternates: { canonical: `/coloriages/${themeSlug}/${slug}` },
    openGraph: { title: sujet.titre, description: sujet.intro, images: image },
  };
}

export default async function ColoriagePage({ params }: Params) {
  const { theme: themeSlug, slug } = await params;
  const theme = getTheme(themeSlug);
  const sujet = getSujet(themeSlug, slug);
  if (!theme || !sujet) notFound();

  // Le sujet existe dans le dépôt, mais son dessin peut ne pas être publié :
  // une page sans image n'a aucune raison d'exister.
  const dessin = await getColoriage(slug);
  if (!dessin || dessin.statut !== "publie") notFound();

  const fichier = nomFichierImage(slug, dessin.mime);
  const src = `/coloriages/image/${fichier}`;

  const autres = (await listerPublies(theme.slug))
    .filter((row) => row.slug !== slug)
    .slice(0, 8)
    .map((row) => {
      const sujetLie = getSujet(theme.slug, row.slug);
      return sujetLie
        ? { ...sujetLie, fichier: nomFichierImage(row.slug, row.mime) }
        : null;
    })
    .filter((autre): autre is NonNullable<typeof autre> => autre !== null);

  // ImageObject : c'est l'image qui est le contenu de cette page, et c'est par
  // Google Images que passe l'essentiel du trafic sur ces requêtes.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        name: sujet.titre,
        description: sujet.intro,
        contentUrl: absoluteUrl(src),
        width: dessin.largeur,
        height: dessin.hauteur,
        encodingFormat: dessin.mime,
        isFamilyFriendly: true,
        creditText: SITE_NAME,
        license: absoluteUrl("/cgv"),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Coloriages",
            item: absoluteUrl("/coloriages"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: theme.nom,
            item: absoluteUrl(`/coloriages/${theme.slug}`),
          },
          { "@type": "ListItem", position: 3, name: sujet.titre },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/coloriages" className="font-semibold hover:text-grape">
          Coloriages
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        <Link
          href={`/coloriages/${theme.slug}`}
          className="font-semibold hover:text-grape"
        >
          {theme.nom}
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        <span className="font-semibold text-ink">{sujet.titre}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-card border-2 border-ink bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${sujet.titre} — dessin au trait à colorier`}
            width={dessin.largeur}
            height={dessin.hauteur}
            className="h-auto w-full"
          />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {sujet.titre}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="ink">{ageConseille(sujet.difficulte)}</Badge>
            <Badge tone="success">Gratuit</Badge>
            <Badge tone="grape">Format A4</Badge>
          </div>

          <p className="mt-4 text-muted">{sujet.intro}</p>

          <div className="mt-6">
            <TelechargerColoriage
              src={src}
              nomFichier={fichier.replace(/\.[a-z]+$/, "")}
              extension={fichier.replace(/^.*\./, "")}
            />
          </div>

          <Card tone="soft" className="mt-6 bg-paper p-4">
            <h2 className="flex items-center gap-2 font-display font-bold">
              <Printer className="h-4 w-4 text-grape" strokeWidth={2} />
              Conseils d&apos;impression
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>· En A4, à 100 % (sans « ajuster à la page »)</li>
              <li>· Papier 120 g+ si tu utilises des feutres</li>
            </ul>
          </Card>
        </div>
      </div>

      {autres.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            D&apos;autres coloriages {theme.nom.toLowerCase()}
          </h2>
          <ul className="mt-5 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {autres.map((autre) => (
              <Card as="li" key={autre.slug} className="p-0">
                <Link
                  href={`/coloriages/${theme.slug}/${autre.slug}`}
                  className="flex h-full flex-col p-3 transition-colors hover:bg-paper"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/coloriages/image/${autre.fichier}`}
                    alt={autre.titre}
                    loading="lazy"
                    className="aspect-square w-full rounded-tile border-2 border-line bg-white object-contain"
                  />
                  <span className="mt-2 text-sm font-bold">{autre.titre}</span>
                </Link>
              </Card>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-14">
        <EtSiCetaitToi />
      </div>
    </div>
  );
}
