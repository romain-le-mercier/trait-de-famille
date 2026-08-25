import { ImagePlus, PenLine, Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "./SectionTitle";

const STEPS = [
  {
    icon: ImagePlus,
    title: "Choisis ta photo",
    text: "Famille, enfants, le chien… nette et bien éclairée, c'est parfait.",
    color: "text-ciel",
  },
  {
    icon: PenLine,
    title: "On dessine le trait",
    text: "Notre outil transforme ta photo en dessin au trait, prêt à colorier.",
    color: "text-raisin",
  },
  {
    icon: Printer,
    title: "Imprime et colorie",
    text: "Télécharge en HD, sors les crayons, et c'est parti.",
    color: "text-feuille",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="border-b-2 border-ink px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Comment ça marche"
          title="Trois étapes, pas une de plus."
        />
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card as="li" key={step.title} className="relative p-6">
              <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-tangerine font-display font-bold">
                {index + 1}
              </span>
              <step.icon
                className={`mb-4 mt-2 h-9 w-9 ${step.color}`}
                strokeWidth={1.8}
              />
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </Card>
          ))}
        </ol>
      </div>
    </section>
  );
}
