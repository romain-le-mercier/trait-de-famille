"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Coins,
  Download,
  Lock,
  Palette,
  Trash2,
  Unlock,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { Scene } from "@/components/illustrations/Scene";
import { forget, unlockArtwork } from "@/lib/artworks";
import { downloadBlob, loadBitmap, slugDate } from "@/lib/image";
import { DETAIL_LABELS, STROKE_LABELS } from "@/lib/lineart/types";
import { buildColoringPdf } from "@/lib/pdf";
import { useAccount, useAppStore, useHydrated } from "@/lib/store";
import { getArtworkHd, getArtworkThumb } from "@/lib/storage";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function GalleryFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const account = useAccount();
  const credits = account.credits;
  const items = useAppStore((s) => s.items);
  const setPendingUnlock = useAppStore((s) => s.setPendingUnlock);

  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const created: string[] = [];

    (async () => {
      const next: Record<string, string> = {};
      for (const item of items) {
        const thumb = await getArtworkThumb(item.id);
        if (!thumb) continue;
        const url = URL.createObjectURL(thumb);
        created.push(url);
        next[item.id] = url;
      }
      if (!cancelled) setThumbs(next);
    })();

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [hydrated, items]);

  /**
   * Débloque un essai déjà dessiné. Le modèle n'est pas rappelé : c'est
   * exactement l'image de l'aperçu qui devient imprimable.
   */
  const unlock = async (id: string) => {
    if (!account.signedIn) {
      router.push("/connexion?next=/mes-coloriages");
      return;
    }
    setBusyId(id);
    setError(null);
    const outcome = await unlockArtwork(id);
    setBusyId(null);

    // La vignette se recharge toute seule : le store a changé.
    if (outcome.ok) return;

    if (outcome.reason === "auth") {
      router.push("/connexion?next=/mes-coloriages");
      return;
    }
    if (outcome.reason === "credits") {
      // On retient lequel : après paiement, il est livré directement.
      setPendingUnlock(id);
      router.push("/debloquer");
      return;
    }
    setError(
      outcome.reason === "missing"
        ? "Ce dessin n'est plus dans ce navigateur. Aucun crédit n'a été utilisé."
        : (outcome.message ??
          "Le déblocage a échoué. Aucun crédit n'a été utilisé."),
    );
  };

  const redownload = async (id: string) => {
    setBusyId(id);
    try {
      const hd = await getArtworkHd(id);
      if (!hd) return;
      const bitmap = await loadBitmap(hd);
      const pdf = await buildColoringPdf(hd, {
        width: bitmap.width,
        height: bitmap.height,
      });
      bitmap.close?.();
      downloadBlob(pdf, `trait-de-famille-${slugDate(new Date())}.pdf`);
    } finally {
      setBusyId(null);
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-card border-2 border-line bg-paper" />
    );
  }

  const tests = items.filter((item) => !item.unlocked).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Mes coloriages
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-muted">
            {account.signedIn ? (
              <>
                <Badge tone={credits > 0 ? "tangerine" : "ink"}>
                  <Coins className="h-3.5 w-3.5" strokeWidth={2.2} />
                  {credits} {credits > 1 ? "crédits" : "crédit"}
                </Badge>
                {credits === 0 &&
                  "Prends un pack pour débloquer tes prochains dessins."}
              </>
            ) : (
              "Connecte-toi pour retrouver tes crédits."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/debloquer" variant="ink">
            <Coins className="h-4 w-4" strokeWidth={2.2} />
            Acheter des crédits
          </ButtonLink>
          <ButtonLink href="/creer">
            <Palette className="h-4 w-4" strokeWidth={2.2} />
            Nouveau coloriage
          </ButtonLink>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {tests > 0
          ? "Tes essais sont gardés tels quels : les débloquer ne redessine rien, tu reçois exactement l'image que tu as validée. Le tout vit dans ce navigateur — pense à télécharger les PDF que tu veux conserver."
          : "Tes coloriages sont conservés dans ce navigateur. Pense à télécharger les PDF que tu veux garder."}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-error"
            strokeWidth={2.2}
          />
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center gap-4 p-10 text-center">
          <Scene
            mode="lineart"
            scene="enfantChien"
            className="w-48 opacity-70"
            doodles={false}
          />
          <p className="font-display text-xl font-semibold">
            Pas encore de coloriage. Ajoute ta première photo !
          </p>
          <ButtonLink href="/creer" size="lg">
            <Palette className="h-5 w-5" strokeWidth={2.2} />
            Créer mon coloriage
          </ButtonLink>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card as="li" key={item.id} className="flex flex-col gap-3 p-4">
              <div className="relative overflow-hidden rounded-tile border-2 border-line bg-white">
                {thumbs[item.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbs[item.id]}
                    alt={`Coloriage du ${dateFormat.format(item.createdAt)}`}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-paper" />
                )}
                {!item.unlocked && (
                  <Badge tone="ink" className="absolute left-2 top-2">
                    <Lock className="h-3 w-3" strokeWidth={2.4} />
                    Essai
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold">
                  {dateFormat.format(item.createdAt)}
                </p>
                <p className="text-xs text-muted">
                  {DETAIL_LABELS[item.settings.detail].label} · trait{" "}
                  {STROKE_LABELS[item.settings.stroke].label.toLowerCase()}
                </p>
              </div>
              <div className="flex gap-2">
                {item.unlocked ? (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => redownload(item.id)}
                    disabled={busyId === item.id}
                  >
                    <Download className="h-4 w-4" strokeWidth={2.2} />
                    {busyId === item.id ? "…" : "PDF"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => unlock(item.id)}
                    disabled={busyId === item.id}
                  >
                    <Unlock className="h-4 w-4" strokeWidth={2.2} />
                    {busyId === item.id ? "…" : "Débloquer"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ink"
                  onClick={() => forget(item.id)}
                  aria-label="Supprimer ce coloriage"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
