"use client";

import Image from "next/image";
import { BeforeAfter } from "@/components/BeforeAfter";
import { SectionTitle } from "./SectionTitle";

interface Example {
  slug: string;
  caption: string;
  alt: string;
  /** Position de départ du curseur, choisie pour que le sujet soit visible
   *  côté dessin — c'est le dessin qu'on vend, pas la photo. */
  initial: number;
}

/**
 * Vrais rendus, produits avec l'app. Les trois paires partagent le même
 * ratio 3:2, donc les deux faces du comparateur restent alignées au pixel.
 */
const EXAMPLES: Example[] = [
  {
    slug: "jardin-chien",
    caption: "Un mercredi au jardin, chien compris",
    alt: "Une mère, sa fille et leur colley assis dans l'herbe",
    initial: 42,
  },
  {
    slug: "balade-velo",
    caption: "La balade du dimanche",
    alt: "Une famille de trois à vélo sur un chemin de forêt",
    initial: 38,
  },
  {
    slug: "portrait-enfant",
    caption: "Un portrait tout simple",
    alt: "Un jeune enfant blond qui sourit dans un parc",
    initial: 22,
  },
];

export function Examples() {
  return (
    <section id="exemples" className="border-b-2 border-ink bg-paper px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Exemples"
          title="Ça donne ça."
          subtitle="Tire la poignée pour passer de la photo au coloriage."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {EXAMPLES.map((example, index) => (
            <figure key={example.slug}>
              <div className="overflow-hidden rounded-card border-2 border-ink bg-white">
                <BeforeAfter
                  className="aspect-[3/2] w-full"
                  initial={example.initial}
                  before={
                    <Image
                      src={`/exemples/${example.slug}-photo.jpg`}
                      alt={example.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                  }
                  after={
                    <Image
                      src={`/exemples/${example.slug}-trait.jpg`}
                      alt={`${example.alt}, en dessin au trait à colorier`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="bg-white object-cover"
                    />
                  }
                />
              </div>
              <figcaption className="mt-3 text-center text-sm font-semibold text-muted">
                {example.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Trois rendus obtenus avec Trait de Famille, sans retouche.
        </p>
      </div>
    </section>
  );
}
