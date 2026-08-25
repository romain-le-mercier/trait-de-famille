import { CreditCard, Eye, ShieldOff } from "lucide-react";

const ITEMS = [
  {
    icon: Eye,
    title: "Tu vois avant de payer",
    text: "L'aperçu est gratuit. Tu ne paies que si le dessin te plaît, et tu récupères exactement celui que tu as validé.",
  },
  {
    icon: CreditCard,
    title: "Paiement 100% sécurisé",
    text: "Le paiement est traité par Stripe. Nous ne voyons jamais ton numéro de carte.",
  },
  {
    icon: ShieldOff,
    title: "Pas d'abonnement, pas de surprise",
    text: "Tu paies à l'unité ou en pack de crédits. Rien ne se renouvelle tout seul.",
  },
];

export function Trust() {
  return (
    <section className="border-b-2 border-ink bg-paper px-4 py-14 md:px-6">
      <ul className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white">
              <item.icon className="h-5 w-5 text-grape" strokeWidth={2} />
            </span>
            <div>
              <h3 className="font-display font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
