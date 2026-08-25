import { CloudRain, Gift, PartyPopper, School } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "./SectionTitle";

const CASES = [
  {
    icon: CloudRain,
    title: "Un mercredi pluvieux",
    text: "Dix minutes pour préparer, une heure de calme à la table du salon.",
  },
  {
    icon: Gift,
    title: "Un cadeau qui touche",
    text: "Les grands-parents reçoivent leurs petits-enfants en dessin. Effet garanti.",
  },
  {
    icon: PartyPopper,
    title: "L'anniversaire des enfants",
    text: "Un coloriage par invité, avec sa tête dessus. L'atelier est prêt.",
  },
  {
    icon: School,
    title: "En classe ou en atelier",
    text: "Imprime autant d'exemplaires que nécessaire, le fichier est à toi.",
  },
];

export function UseCases() {
  return (
    <section className="border-b-2 border-ink px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Pour quoi faire"
          title="Un dessin, plein de moments."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CASES.map((item) => (
            <Card as="li" key={item.title} tone="soft" className="p-6">
              <item.icon className="mb-4 h-8 w-8 text-grape" strokeWidth={1.8} />
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </Card>
          ))}
        </ul>
      </div>
    </section>
  );
}
