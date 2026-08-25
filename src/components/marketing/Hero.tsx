"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Palette, Printer, Sparkles, WalletMinimal } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Scene } from "@/components/illustrations/Scene";
import { Scribble } from "@/components/ui/Card";

const REASSURANCES = [
  { icon: Eye, label: "Aperçu gratuit" },
  { icon: WalletMinimal, label: "Sans abonnement" },
  { icon: Printer, label: "Prêt à imprimer en A4" },
];

export function Hero() {
  const [play, setPlay] = useState(0);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      <div className="doodle-dots absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-grape bg-white px-3 py-1 text-sm font-bold text-grape">
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            Aperçu gratuit, en 2 minutes
          </p>

          <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Transforme tes photos en{" "}
            <span className="relative whitespace-nowrap">
              coloriages
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-tangerine"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C 40 2, 70 10, 105 5 C 140 1, 170 9, 198 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted">
            Envoie une photo de famille, on la transforme en dessin au trait prêt
            à colorier. À imprimer à la maison en 2 minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/creer" size="lg">
              <Palette className="h-5 w-5" strokeWidth={2.2} />
              Créer mon coloriage
            </ButtonLink>
            <a
              href="#exemples"
              className="font-semibold text-grape underline decoration-2 underline-offset-4 hover:text-grape-dark"
            >
              Voir des exemples
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
            {REASSURANCES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-grape" strokeWidth={2.2} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Démo : la photo derrière, le coloriage devant qui se remplit. */}
        <div className="relative mx-auto w-full max-w-md pt-6 sm:pt-0">
          <div className="absolute left-0 top-0 w-[38%] rotate-[-7deg] rounded-tile border-2 border-ink bg-white p-2 shadow-[0_8px_24px_-10px_rgba(123,97,255,0.5)] sm:-left-2 sm:-top-6 sm:w-2/5">
            <Scene mode="photo" className="w-full rounded-[10px]" />
            <p className="pt-1 text-center text-xs font-bold text-muted">
              ta photo
            </p>
          </div>

          <div
            ref={cardRef}
            onMouseEnter={() => setPlay((value) => value + 1)}
            onClick={() => setPlay((value) => value + 1)}
            className="relative ml-auto w-[86%] rotate-[2deg] cursor-pointer rounded-card border-2 border-ink bg-white p-3 shadow-[0_14px_36px_-14px_rgba(123,97,255,0.55)] transition-transform hover:rotate-0"
          >
            <Scene
              key={play}
              mode="lineart"
              filled={visible}
              className="w-full rounded-tile"
            />
            <div className="flex items-center justify-between px-1 pt-2">
              <Scribble className="text-xl">et hop, à colorier !</Scribble>
              <span className="text-xs font-bold text-muted">
                <span className="hidden sm:inline">survole</span>
                <span className="sm:hidden">touche</span> pour rejouer
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
