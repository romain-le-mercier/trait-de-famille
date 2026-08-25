import { Suspense } from "react";
import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { PaywallFlow } from "./PaywallFlow";

export const metadata: Metadata = {
  title: "Débloque ton coloriage",
  description: "PDF haute définition, format A4, sans filigrane. Sans abonnement.",
};

export default function DebloquerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowHeader backTo="/apercu" backLabel="Retour à l'aperçu" />
      <main className="doodle-dots flex-1 px-4 py-10 md:px-6">
        <Suspense
          fallback={
            <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-card border-2 border-line bg-paper" />
          }
        >
          <PaywallFlow />
        </Suspense>
      </main>
    </div>
  );
}
