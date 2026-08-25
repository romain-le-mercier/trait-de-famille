import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Scene } from "@/components/illustrations/Scene";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="doodle-dots flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <Scene mode="lineart" scene="enfantChien" className="w-56" doodles={false} />
        <h1 className="font-display text-3xl font-bold">
          Cette page est restée dans le carton à crayons.
        </h1>
        <p className="max-w-md text-muted">
          Elle n&apos;existe pas (ou plus). Reprenons depuis le début : une photo,
          un coloriage.
        </p>
        <ButtonLink href="/creer" size="lg">
          Créer mon coloriage
        </ButtonLink>
      </main>
      <SiteFooter />
    </div>
  );
}
