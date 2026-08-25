import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { UploadFlow } from "./UploadFlow";

export const metadata: Metadata = {
  title: "Ajoute ta photo",
  description:
    "Choisis une photo nette et bien éclairée, on la transforme en dessin au trait.",
  // Seule page du tunnel qui reste indexable : c'est une porte d'entrée
  // valable, elle ne suppose rien d'un visiteur qui arrive de l'extérieur.
  alternates: { canonical: "/creer" },
};

export default function CreerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowHeader backTo="/" backLabel="Accueil" />
      <main className="doodle-dots flex flex-1 items-start justify-center px-4 py-10 md:py-14">
        <UploadFlow />
      </main>
    </div>
  );
}
