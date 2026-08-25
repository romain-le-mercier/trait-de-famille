import { Suspense } from "react";
import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { SuccessFlow } from "./SuccessFlow";

export const metadata: Metadata = {
  title: "C'est prêt !",
  description: "Télécharge ton coloriage en PDF haute définition et imprime-le.",
};

export default function MerciPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowHeader backTo="/" backLabel="Accueil" />
      <main className="flex-1 px-4 py-10 md:px-6">
        <Suspense
          fallback={
            <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-card border-2 border-line bg-paper" />
          }
        >
          <SuccessFlow />
        </Suspense>
      </main>
    </div>
  );
}
