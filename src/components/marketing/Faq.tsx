import { Accordion, type QaItem } from "@/components/ui/Accordion";
import { SectionTitle } from "./SectionTitle";

export const FAQ_ITEMS: QaItem[] = [
  {
    question: "Quelles photos marchent le mieux ?",
    answer:
      "Les photos nettes, bien éclairées, avec des visages visibles. Évite le flou et les arrière-plans très chargés.",
  },
  {
    question: "Je peux imprimer plusieurs fois ?",
    answer:
      "Oui. Le PDF est à toi : imprime-le autant de fois que tu veux, chez toi ou en boutique.",
  },
  {
    question: "Que devient ma photo ?",
    answer:
      "Elle sert uniquement à produire ton coloriage. Les conditions détaillées figurent dans nos CGV et notre politique de confidentialité.",
  },
  {
    question: "C'est quel format de fichier ?",
    answer:
      "Un PDF haute définition prêt à imprimer en A4 (l'A3 marche aussi). Le PNG est également téléchargeable.",
  },
  {
    question: "Il faut un abonnement ?",
    answer:
      "Non. Tu paies à l'unité, ou tu prends un pack de crédits — sans engagement, et les crédits n'expirent pas.",
  },
  {
    question: "Ça marche avec les animaux ?",
    answer:
      "Bien sûr ! Le chien, le chat, le poney… ils adorent finir en coloriage.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-b-2 border-ink bg-paper px-4 py-16 md:px-6">
      <div className="mx-auto max-w-3xl">
        <SectionTitle eyebrow="FAQ" title="Les questions qu'on nous pose." />
        <Accordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
