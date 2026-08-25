import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { PreviewFlow } from "./PreviewFlow";

export const metadata: Metadata = {
  title: "Voilà ton coloriage",
  description: "Règle l'épaisseur du trait et le niveau de détail, puis débloque la version HD.",
  // Page de tunnel : sans photo déposée ni compte connecté, elle n'a aucun
  // sens pour un visiteur venu d'un moteur.
  robots: { index: false, follow: true },
};

export default function ApercuPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowHeader backTo="/creer" backLabel="Changer de photo" />
      <main className="flex-1 px-4 py-8 md:px-6 md:py-10">
        <PreviewFlow />
      </main>
    </div>
  );
}
