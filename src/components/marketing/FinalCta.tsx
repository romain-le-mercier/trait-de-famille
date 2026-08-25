import { Palette } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Sparkle } from "@/components/illustrations/Scene";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-paper px-4 py-20 md:px-6">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <Sparkle x={40} y={40} size={22} color="#ffd23f" />
        <Sparkle x={360} y={158} size={18} color="#ff5fa2" />
        <Sparkle x={330} y={36} size={14} color="#3aa0ff" />
        <Sparkle x={64} y={168} size={16} color="#34c77b" />
      </svg>
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Prêt à colorier ta première photo ?
        </h2>
        <p className="mt-4 text-lg text-muted">
          L&apos;aperçu est gratuit. Tu ne paies que si le dessin te plaît.
        </p>
        <ButtonLink href="/creer" size="lg" className="mt-8">
          <Palette className="h-5 w-5" strokeWidth={2.2} />
          Créer mon coloriage
        </ButtonLink>
      </div>
    </section>
  );
}
