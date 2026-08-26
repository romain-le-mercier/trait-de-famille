import { ArrowRight, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BeforeAfter } from "@/components/BeforeAfter";
import { formatPrice, PACKS } from "@/lib/pricing";

/**
 * L'accroche des pages de bibliothèque.
 *
 * C'est tout l'intérêt d'offrir des coloriages : la personne qui vient
 * d'imprimer un éléphant est exactement celle à qui « et si c'était ton
 * enfant sur le dessin ? » parle. La démonstration est faite avec un vrai
 * avant/après, pas avec une promesse.
 */
export function EtSiCetaitToi() {
  return (
    <Card tone="grape" className="border-4 p-6 md:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border-2 border-grape bg-white px-3 py-1 text-xs font-bold text-grape">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            Et si c&apos;était ton enfant ?
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            Le même dessin, mais avec ta photo.
          </h2>
          <p className="mt-3 text-muted">
            Envoie une photo de famille : on la transforme en coloriage au
            trait, prêt à imprimer en A4. L&apos;aperçu est gratuit, tu ne paies
            que si le dessin te plaît — {formatPrice(PACKS[0].amount)}.
          </p>
          <ButtonLink href="/creer" size="lg" className="mt-5">
            Essayer avec ma photo
            <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
          </ButtonLink>
        </div>

        <div className="overflow-hidden rounded-card border-2 border-ink bg-white">
          <BeforeAfter
            className="aspect-[4/3] w-full"
            beforeLabel="La photo"
            afterLabel="Le coloriage"
            before={
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/exemples/jardin-chien-photo.jpg"
                alt="Une photo d'enfant dans le jardin avec son chien"
                className="h-full w-full object-cover"
              />
            }
            after={
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/exemples/jardin-chien-trait.jpg"
                alt="La même photo transformée en dessin au trait à colorier"
                className="h-full w-full bg-white object-cover"
              />
            }
          />
        </div>
      </div>
    </Card>
  );
}
