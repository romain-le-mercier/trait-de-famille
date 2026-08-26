"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Apple,
  CreditCard,
  Info,
  Lock,
  LogIn,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { IncludedList } from "@/components/marketing/Pricing";
import { cx } from "@/lib/cx";
import { DEFAULT_PACK_ID, formatPrice, getPack, PACKS, unitPrice } from "@/lib/pricing";
import { useAccount, useAppStore } from "@/lib/store";

interface StripeStatus {
  enabled: boolean;
  mode: "live" | "test" | null;
}

export function PaywallFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const account = useAccount();
  /** Un essai a été mis de côté : il sera livré tel quel après le paiement. */
  const pending = useAppStore((s) => s.pendingUnlockId);

  const requested = params.get("pack");
  const cancelled = params.get("annule") === "1";
  const [packId, setPackId] = useState(
    requested && getPack(requested) ? requested : DEFAULT_PACK_ID,
  );
  const [stripe, setStripe] = useState<StripeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout")
      .then((response) => response.json())
      .then((data) =>
        setStripe({ enabled: Boolean(data?.enabled), mode: data?.mode ?? null }),
      )
      .catch(() => setStripe({ enabled: false, mode: null }));
  }, []);

  const pack = getPack(packId)!;

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await response.json().catch(() => null);

      if (response.status === 401 || data?.needsAuth) {
        router.push(`/connexion?next=/debloquer?pack=${packId}`);
        return;
      }
      if (!response.ok || !data?.url) {
        // Stripe a pu être retiré depuis le chargement de la page : on
        // rebascule l'affichage sur l'état « paiement indisponible ».
        if (data?.stripeMissing) setStripe({ enabled: false, mode: null });
        throw new Error(data?.message ?? "Le paiement n'a pas pu démarrer.");
      }
      window.location.href = data.url as string;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Paiement indisponible.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold">Débloque ton coloriage</h1>
        <p className="mt-2 text-muted">
          Un paiement, pas d&apos;abonnement. Les crédits n&apos;expirent jamais.
        </p>

        {cancelled ? (
          <p className="mt-4 flex items-start gap-2 rounded-tile border-2 border-line bg-paper p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-grape" strokeWidth={2.2} />
            Paiement annulé — ton dessin t&apos;attend dans « Mes coloriages ».
          </p>
        ) : (
          pending && (
            <p className="mt-4 flex items-start gap-2 rounded-tile border-2 border-line bg-paper p-3 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-grape" strokeWidth={2.2} />
              Le dessin que tu viens de choisir est gardé : après le paiement,
              tu reçois exactement celui-là, sans nouvelle génération.
            </p>
          )
        )}

        {stripe?.mode === "live" && (
          <p className="mt-4 flex items-start gap-2 rounded-tile border-2 border-tangerine bg-tangerine-soft p-3 text-sm font-semibold">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
            Stripe est en mode <strong>réel</strong> : tout paiement sera
            réellement débité. Utilise une clé <code className="font-mono">sk_test_</code>{" "}
            pour tester.
          </p>
        )}

        <Card tone="soft" className="mt-6 bg-paper p-5">
          <h2 className="mb-3 font-display text-lg font-bold">Ce que tu reçois</h2>
          <IncludedList />
        </Card>

        <h2 className="mt-8 mb-3 font-display text-lg font-bold">Choisis ton offre</h2>
        <div role="radiogroup" aria-label="Choisis ton offre" className="grid gap-3">
          {PACKS.map((option) => {
            const selected = option.id === packId;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPackId(option.id)}
                className={cx(
                  "relative flex items-center justify-between gap-4 rounded-tile border-2 p-4 text-left transition-colors",
                  selected
                    ? "border-grape bg-grape-soft"
                    : "border-line hover:border-ink",
                )}
              >
                <span>
                  <span className="flex items-center gap-2 font-display text-lg font-bold">
                    {option.name}
                    {option.badge && (
                      <Badge className="whitespace-nowrap">{option.badge}</Badge>
                    )}
                  </span>
                  <span className="block text-sm text-muted">
                    {option.credits > 1
                      ? `${option.credits} coloriages · ${unitPrice(option)}`
                      : option.tagline}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-display text-xl font-bold">
                    {formatPrice(option.amount)}
                  </span>
                  <span
                    className={cx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-grape bg-grape" : "border-line",
                    )}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={2.2} />
            {error}
          </p>
        )}

        {!account.loaded ? (
          <div className="mt-6 h-14 animate-pulse rounded-full bg-paper" />
        ) : !account.signedIn ? (
          <Card tone="soft" className="mt-6 bg-paper p-5">
            <p className="font-bold">Connecte-toi pour acheter</p>
            <p className="mt-2 text-sm text-muted">
              Les crédits sont rattachés à ton compte : tu les retrouves sur
              n&apos;importe quel appareil, et l&apos;historique de tes achats aussi.
            </p>
            <ButtonLink
              href={`/connexion?next=/debloquer?pack=${packId}`}
              full
              size="lg"
              className="mt-4"
            >
              <LogIn className="h-5 w-5" strokeWidth={2.2} />
              Se connecter avec Google
            </ButtonLink>
          </Card>
        ) : stripe?.enabled === false ? (
          <Card tone="soft" className="mt-6 bg-tangerine-soft p-5">
            <p className="flex items-center gap-2 font-bold">
              <TriangleAlert className="h-4 w-4" strokeWidth={2.2} />
              Paiement indisponible
            </p>
            <p className="mt-2 text-sm text-muted">
              Le paiement n&apos;est pas configuré sur ce serveur. Ton aperçu
              reste accessible, mais aucun coloriage ne peut être débloqué pour
              l&apos;instant.
            </p>
            <p className="mt-3 text-sm text-muted">
              Si tu administres ce site : renseigne{" "}
              <code className="font-mono">STRIPE_SECRET_KEY</code> et redémarre
              le serveur.
            </p>
          </Card>
        ) : (
          <>
            <Button
              full
              size="lg"
              className="mt-6"
              onClick={pay}
              disabled={busy || !stripe}
            >
              <Lock className="h-5 w-5" strokeWidth={2.2} />
              {busy
                ? "Redirection vers le paiement…"
                : `Payer et télécharger — ${formatPrice(pack.amount)}`}
            </Button>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Apple className="h-4 w-4" strokeWidth={2} />
                Apple Pay
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-ink">G</span>
                Google Pay
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" strokeWidth={2} />
                Carte bancaire
              </span>
            </div>
          </>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-success" strokeWidth={2.2} />
          Paiement sécurisé par Stripe · Téléchargement immédiat · Sans abonnement.
        </p>
      </Card>
    </div>
  );
}
