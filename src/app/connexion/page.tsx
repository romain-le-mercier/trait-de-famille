import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { SignInPanel } from "./SignInPanel";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi pour acheter des crédits et retrouver tes coloriages.",
};

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowHeader backTo="/" backLabel="Accueil" />
      <main className="doodle-dots flex flex-1 items-start justify-center px-4 py-12">
        <SignInPanel />
      </main>
    </div>
  );
}
