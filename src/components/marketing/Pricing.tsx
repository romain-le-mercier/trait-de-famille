import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { formatPrice, PACKS, unitPrice } from "@/lib/pricing";
import { cx } from "@/lib/cx";
import { SectionTitle } from "./SectionTitle";

const INCLUDED = [
  "Fichier PDF haute définition",
  "Format A4 prêt à imprimer",
  "Sans filigrane",
  "À toi pour toujours",
];

export function PricingCards({ hrefBase = "/debloquer" }: { hrefBase?: string }) {
  return (
    <div className="grid items-start gap-6 md:grid-cols-3">
      {PACKS.map((pack) => {
        const featured = Boolean(pack.badge);
        return (
          <Card
            key={pack.id}
            tone={featured ? "grape" : "ink"}
            className={cx(
              "relative flex h-full flex-col p-6",
              featured && "border-4 md:-mt-3 md:pb-8 md:pt-8",
            )}
          >
            {pack.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-ink whitespace-nowrap">
                {pack.badge}
              </Badge>
            )}
            <h3 className="font-display text-xl font-semibold">{pack.name}</h3>
            <p className="mt-3 font-display text-4xl font-bold">
              {formatPrice(pack.amount)}
            </p>
            <p className="mt-1 text-sm font-semibold text-grape">
              {pack.credits > 1
                ? `${pack.credits} coloriages · ${unitPrice(pack)}`
                : "1 coloriage"}
            </p>
            {pack.tagline && (
              <p className="mt-3 text-sm text-muted">{pack.tagline}</p>
            )}
            <ButtonLink
              href={`${hrefBase}?pack=${pack.id}`}
              variant={featured ? "primary" : "ink"}
              full
              className="mt-6"
            >
              Choisir
            </ButtonLink>
          </Card>
        );
      })}
    </div>
  );
}

export function IncludedList({ className }: { className?: string }) {
  return (
    <ul className={cx("space-y-2", className)}>
      {INCLUDED.map((item) => (
        <li key={item} className="flex items-center gap-2 font-semibold">
          <Check className="h-5 w-5 shrink-0 text-success" strokeWidth={3} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  return (
    <section id="tarifs" className="border-b-2 border-ink px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Tarifs"
          title="Tu paies le dessin, pas l'abonnement."
          subtitle="Les crédits n'expirent jamais. Tu les utilises quand tu veux."
        />
        <PricingCards />
        <p className="mt-8 text-center text-sm text-muted">
          Aperçu gratuit avant de payer · Paiement sécurisé · Sans abonnement.
        </p>
      </div>
    </section>
  );
}
