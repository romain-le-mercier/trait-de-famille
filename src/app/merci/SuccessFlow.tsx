"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Download,
  FileImage,
  Palette,
  Printer,
  Share2,
} from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { GeneratingOverlay } from "@/components/flow/GeneratingOverlay";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Scribble } from "@/components/ui/Card";
import { unlockArtwork } from "@/lib/artworks";
import { downloadBlob, loadBitmap, slugDate } from "@/lib/image";
import { buildColoringPdf } from "@/lib/pdf";
import { useAccount, useAppStore, useHydrated } from "@/lib/store";
import { getArtworkHd, getArtworkThumb } from "@/lib/storage";

type Status = "working" | "ready" | "credits-only" | "error";

const PRINT_TIPS = [
  "Imprime en A4, à 100% (sans « ajuster à la page »)",
  "Un papier un peu épais (120 g+) évite que les feutres traversent",
  "En couleur ou en noir & blanc, comme tu veux",
];

export function SuccessFlow() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const account = useAccount();

  const [status, setStatus] = useState<Status>("working");
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0.05);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [artId, setArtId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<null | "pdf" | "png">(null);
  const [shared, setShared] = useState(false);

  const started = useRef(false);
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  useEffect(() => {
    if (!hydrated || !account.loaded || started.current) return;
    started.current = true;

    (async () => {
      const sessionId = params.get("session_id");

      // 1. Retour de Stripe : on vérifie le paiement, le serveur crédite.
      //    (Le webhook fait la même chose ; l'opération est idempotente.)
      if (sessionId) {
        try {
          const response = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = await response.json().catch(() => null);
          if (response.ok && data?.paid) {
            useAppStore.getState().setCredits(Number(data.credits ?? 0));
          } else if (data?.message) {
            setMessage(data.message);
          }
        } catch {
          setMessage("On n'a pas pu vérifier le paiement. Recharge la page.");
        }
      } else {
        await useAppStore.getState().refreshAccount();
      }

      // 2. Un coloriage déjà débloqué ? On l'affiche.
      const explicitId = params.get("id");
      if (explicitId && (await showArtwork(explicitId))) return;

      // 3. L'essai mis de côté avant le paiement, et un crédit pour le
      //    couvrir : on le débloque. Rien n'est régénéré — on livre exactement
      //    l'image que l'utilisateur avait approuvée dans l'aperçu.
      const pending = useAppStore.getState().pendingUnlockId;
      if (pending) {
        useAppStore.getState().setPendingUnlock(null);
        const item = useAppStore.getState().items.find((i) => i.id === pending);

        if (item?.unlocked && (await showArtwork(pending))) return;

        if (item && useAppStore.getState().account.credits > 0) {
          setProgress(0.4);
          const outcome = await unlockArtwork(pending);
          if (outcome.ok && (await showArtwork(pending))) return;
          if (!outcome.ok && outcome.reason === "error") {
            setMessage("L'enregistrement a échoué. Ton crédit n'a pas été utilisé.");
          }
        }
      }

      setStatus(
        useAppStore.getState().account.credits > 0 ? "credits-only" : "error",
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, account.loaded]);

  const showArtwork = async (id: string) => {
    const thumb = await getArtworkThumb(id);
    if (!thumb) return false;
    const url = URL.createObjectURL(thumb);
    urlsRef.current.push(url);
    setThumbUrl(url);
    setArtId(id);
    setStatus("ready");
    return true;
  };

  const download = async (kind: "pdf" | "png") => {
    if (!artId) return;
    setDownloading(kind);
    try {
      const hd = await getArtworkHd(artId);
      if (!hd) throw new Error("introuvable");
      const name = `trait-de-famille-${slugDate()}`;
      if (kind === "png") {
        downloadBlob(hd, `${name}.png`);
      } else {
        const bitmap = await loadBitmap(hd);
        const pdf = await buildColoringPdf(hd, {
          width: bitmap.width,
          height: bitmap.height,
        });
        bitmap.close?.();
        downloadBlob(pdf, `${name}.pdf`);
      }
    } catch {
      setMessage("Le téléchargement a échoué. Réessaie depuis « Mes coloriages ».");
    } finally {
      setDownloading(null);
    }
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const text =
      "J'ai transformé une photo de famille en coloriage à imprimer, tu vas adorer :";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Trait de Famille", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      /* partage annulé : rien à signaler */
    }
  };

  if (status === "working") {
    return (
      <div className="mx-auto max-w-md">
        <div className="relative h-72 overflow-hidden rounded-card border-2 border-ink bg-white">
          <GeneratingOverlay progress={progress} label="On prépare ton fichier…" />
        </div>
      </div>
    );
  }

  if (status === "credits-only" || status === "error") {
    const isCredits = status === "credits-only";
    return (
      <div className="mx-auto max-w-lg text-center">
        <Card className="p-8">
          <h1 className="font-display text-3xl font-bold">
            {isCredits ? "Tes crédits sont ajoutés 🎉" : "Il manque le coloriage"}
          </h1>
          <p className="mt-3 text-muted">
            {isCredits
              ? `Il te reste ${account.credits} ${account.credits > 1 ? "crédits" : "crédit"}. Débloque un de tes essais depuis « Mes coloriages », ou repars d'une nouvelle photo.`
              : "On n'a pas retrouvé de coloriage à télécharger. Tes essais restent dans « Mes coloriages »."}
          </p>
          {message && (
            <p className="mt-4 flex items-start gap-2 rounded-tile border-2 border-line bg-paper p-3 text-left text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-tangerine" strokeWidth={2.2} />
              {message}
            </p>
          )}
          <ButtonLink href="/creer" size="lg" className="mt-6">
            <Palette className="h-5 w-5" strokeWidth={2.2} />
            Créer mon coloriage
          </ButtonLink>
          <Link
            href="/mes-coloriages"
            className="mt-4 block text-sm font-semibold text-grape underline decoration-2 underline-offset-4"
          >
            Voir mes coloriages
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Confetti />
      <div className="relative z-40 mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold">C&apos;est prêt ! 🎉</h1>
          <p className="mt-2 text-muted">
            Ton coloriage est en haute définition, sans filigrane. À toi de jouer.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="w-64 -rotate-2 rounded-card border-2 border-ink bg-white p-3 shadow-[0_14px_36px_-14px_rgba(123,97,255,0.55)]">
            {thumbUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl}
                alt="Ton coloriage prêt à imprimer"
                className="w-full rounded-[10px]"
              />
            )}
            <Scribble className="mt-2 block text-center text-xl">
              sors les crayons !
            </Scribble>
          </div>

          <div className="mt-7 flex w-full max-w-md flex-col gap-3">
            <Button size="lg" full onClick={() => download("pdf")} disabled={downloading !== null}>
              <Download className="h-5 w-5" strokeWidth={2.2} />
              {downloading === "pdf"
                ? "Préparation du PDF…"
                : "Télécharger mon coloriage (PDF)"}
            </Button>
            <Button
              variant="ink"
              full
              onClick={() => download("png")}
              disabled={downloading !== null}
            >
              <FileImage className="h-4 w-4" strokeWidth={2.2} />
              {downloading === "png" ? "Préparation…" : "Télécharger l'image (PNG)"}
            </Button>
          </div>

          {account.credits > 0 && (
            <p className="mt-4 text-sm font-semibold text-muted">
              Il te reste {account.credits}{" "}
              {account.credits > 1 ? "coloriages" : "coloriage"}.
            </p>
          )}

          {message && (
            <p className="mt-4 flex max-w-md items-start gap-2 rounded-tile border-2 border-line bg-paper p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-tangerine" strokeWidth={2.2} />
              {message}
            </p>
          )}
        </div>

        <Card tone="soft" className="mt-10 bg-paper p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Printer className="h-5 w-5 text-grape" strokeWidth={2} />
            Conseils d&apos;impression
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            {PRINT_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-grape" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Card className="flex flex-col p-5">
            <h3 className="font-display text-lg font-bold">Encore une photo ?</h3>
            <p className="mt-1 flex-1 text-sm text-muted">
              Les packs reviennent moins cher — et les crédits n&apos;expirent pas.
            </p>
            <ButtonLink href="/creer" full className="mt-4">
              <Palette className="h-4 w-4" strokeWidth={2.2} />
              Créer un autre coloriage
            </ButtonLink>
          </Card>

          <Card className="flex flex-col p-5">
            <h3 className="font-display text-lg font-bold">
              Fais-en un livret à colorier
            </h3>
            <p className="mt-1 flex-1 text-sm text-muted">
              Plusieurs dessins reliés en un petit cahier, à offrir aux
              grands-parents.
            </p>
            <ButtonLink href="/#tarifs" variant="secondary" full className="mt-4">
              <BookOpen className="h-4 w-4" strokeWidth={2.2} />
              En savoir plus
            </ButtonLink>
          </Card>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Button variant="ghost" onClick={share}>
            <Share2 className="h-4 w-4" strokeWidth={2.2} />
            {shared ? "Lien copié !" : "Partage à un parent qui va adorer."}
          </Button>
          <Link
            href="/mes-coloriages"
            className="text-sm font-semibold text-grape underline decoration-2 underline-offset-4"
          >
            Voir tous mes coloriages
          </Link>
        </div>
      </div>
    </>
  );
}
