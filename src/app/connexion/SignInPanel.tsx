"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function Panel() {
  const params = useSearchParams();
  const next = params.get("next") ?? params.get("callbackUrl") ?? "/mes-coloriages";
  const errorCode = params.get("error");
  const [busy, setBusy] = useState(false);

  return (
    <div className="w-full max-w-md">
      <Card className="p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold">Connexion</h1>
        <p className="mt-2 text-muted">
          Ton compte sert à conserver tes crédits et l&apos;historique de tes
          achats. Pas de mot de passe à retenir.
        </p>

        {errorCode && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={2.2} />
            La connexion n&apos;a pas abouti ({errorCode}). Réessaie, et vérifie
            que l&apos;URL de redirection est bien autorisée côté Google.
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void signIn("google", { redirectTo: next });
          }}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border-2 border-ink bg-white py-3 font-bold transition-colors hover:bg-paper disabled:opacity-50"
        >
          <GoogleGlyph />
          {busy ? "Ouverture de Google…" : "Continuer avec Google"}
        </button>

        <p className="mt-5 flex items-start gap-2 text-xs text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2.2} />
          On récupère seulement ton nom, ton adresse e-mail et ton avatar Google.
        </p>
      </Card>
    </div>
  );
}

export function SignInPanel() {
  return (
    <Suspense
      fallback={
        <div className="h-72 w-full max-w-md animate-pulse rounded-card border-2 border-line bg-paper" />
      }
    >
      <Panel />
    </Suspense>
  );
}
