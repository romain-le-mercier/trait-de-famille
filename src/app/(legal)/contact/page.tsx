import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { FAQ_ITEMS } from "@/components/marketing/Faq";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Une question ?</h1>
      <p>
        Écris-nous à [à compléter : adresse de contact]. On répond en général
        dans la journée, en semaine.
      </p>
      <p>
        Avant ça, la réponse est peut-être juste en dessous.
      </p>
      <div className="mt-6">
        <Accordion items={FAQ_ITEMS} />
      </div>
      <ButtonLink href="/creer" className="mt-8">
        Créer mon coloriage
      </ButtonLink>
    </>
  );
}
