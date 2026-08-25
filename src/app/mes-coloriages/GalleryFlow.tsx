"use client";

import { useEffect, useState } from "react";
import { Coins, Download, Palette, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { Scene } from "@/components/illustrations/Scene";
import { downloadBlob, loadBitmap, slugDate } from "@/lib/image";
import { DETAIL_LABELS, STROKE_LABELS } from "@/lib/lineart/types";
import { buildColoringPdf } from "@/lib/pdf";
import { useAccount, useAppStore, useHydrated } from "@/lib/store";
import { deleteArtwork, getArtworkHd, getArtworkThumb } from "@/lib/storage";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function GalleryFlow() {
  const hydrated = useHydrated();
  const account = useAccount();
  const credits = account.credits;
  const items = useAppStore((s) => s.items);
  const removeItem = useAppStore((s) => s.removeItem);

  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const remove = async (id: string) => {
    await deleteArtwork(id);
    removeItem(id);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-card border-2 border-line bg-paper" />
    );
  }

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
        Tes coloriages sont conservés dans ce navigateur. Pense à télécharger les
        PDF que tu veux garder.
      </p>

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
              <div className="overflow-hidden rounded-tile border-2 border-line bg-white">
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
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => redownload(item.id)}
                  disabled={busyId === item.id}
                >
                  <Download className="h-4 w-4" strokeWidth={2.2} />
                  {busyId === item.id ? "…" : "PDF"}
                </Button>
                <Button
                  size="sm"
                  variant="ink"
                  onClick={() => remove(item.id)}
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
