export interface Pack {
  id: string;
  name: string;
  credits: number;
  /** Prix en centimes (unité Stripe). */
  amount: number;
  badge?: string;
  tagline?: string;
}

export const PACKS: Pack[] = [
  {
    id: "solo",
    name: "1 coloriage",
    credits: 1,
    amount: 299,
    tagline: "Juste celui-là, pour voir.",
  },
  {
    id: "pack3",
    name: "Pack 3",
    credits: 3,
    amount: 699,
    tagline: "De quoi occuper un mercredi entier.",
  },
  {
    id: "pack10",
    name: "Pack 10",
    credits: 10,
    amount: 1499,
    badge: "Le préféré des familles",
    tagline: "Le meilleur prix, sans date limite.",
  },
];

export const DEFAULT_PACK_ID = "pack10";

export function getPack(id: string): Pack | undefined {
  return PACKS.find((pack) => pack.id === id);
}

export function formatPrice(amountInCents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amountInCents / 100);
}

export function unitPrice(pack: Pack): string {
  return `${formatPrice(Math.round(pack.amount / pack.credits))} l'unité`;
}
