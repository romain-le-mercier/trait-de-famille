"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Crop,
  Info,
  Lock,
  LogIn,
  RefreshCw,
  Scissors,
  Settings2,
  Sparkles,
  Unlock,
} from "lucide-react";
import { BeforeAfter } from "@/components/BeforeAfter";
import { CropDialog } from "@/components/flow/CropDialog";
import { GeneratingOverlay } from "@/components/flow/GeneratingOverlay";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { applyWatermark, canvasToBlob, createCanvas, loadBitmap } from "@/lib/image";
import { renderLineArt } from "@/lib/lineart/render";
import {
  DETAIL_LABELS,
  settingsKey,
  STROKE_LABELS,
  type CropRect,
  type DetailLevel,
  type LineArtSettings,
  type StrokeWidth,
} from "@/lib/lineart/types";
import { formatPrice, PACKS } from "@/lib/pricing";
import { packageArtwork } from "@/lib/produce";
import { useAccount, useAppStore, useHydrated } from "@/lib/store";
import {
  getDraftPhoto,
  getGeneration,
  listGenerations,
  saveArtwork,
  saveDraftMaster,
  saveGeneration,
} from "@/lib/storage";

/**
 * Filigrane de l'aperçu. Ne passer à `false` qu'en local, le temps de récupérer
 * des visuels : sans lui, l'aperçu gratuit *est* le fichier payant.
 */
const WATERMARK_PREVIEW = true;

const soloPrice = formatPrice(PACKS[0].amount);

export function PreviewFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const account = useAccount();
  const draft = useAppStore((s) => s.draft);
  const setSettings = useAppStore((s) => s.setSettings);
  const setCredits = useAppStore((s) => s.setCredits);
  const addItem = useAppStore((s) => s.addItem);
  const patchDraft = useAppStore((s) => s.patchDraft);

  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [master, setMaster] = useState<Blob | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  /** Signature des réglages du dessin actuellement affiché. */
  const [activeKey, setActiveKey] = useState<string | null>(null);
  /** Signatures déjà générées pour ce brouillon : réaffichables sans coût. */
  const [cachedKeys, setCachedKeys] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineReady, setEngineReady] = useState<boolean | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const runRef = useRef(0);
  const urlsRef = useRef<string[]>([]);
  const settings = draft?.settings;
  const wanted = settings ? settingsKey(settings) : null;

  const track = (url: string) => {
    urlsRef.current.push(url);
    return url;
  };

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    },
    [],
  );

  useEffect(() => {
    fetch("/api/generate")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setEngineReady(Boolean(data?.available)))
      .catch(() => setEngineReady(false));
  }, []);

  /** Affiche une image générée (fraîche ou sortie du cache). */
  const show = useCallback(async (blob: Blob, key: string) => {
    setMaster(blob);
    setActiveKey(key);
    // C'est ce fichier-là qui sera livré, y compris après un aller-retour Stripe.
    await saveDraftMaster(blob);

    if (!WATERMARK_PREVIEW) {
      setDisplayUrl(track(URL.createObjectURL(blob)));
      return;
    }
    const bitmap = await loadBitmap(blob);
    const canvas = createCanvas(bitmap.width, bitmap.height);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    applyWatermark(canvas);
    const watermarked = await canvasToBlob(canvas, "image/webp", 0.9);
    setDisplayUrl(track(URL.createObjectURL(watermarked)));
  }, []);

  const generate = useCallback(
    async (target: LineArtSettings) => {
      if (!photo || !draft) return;
      const key = settingsKey(target);
      const run = ++runRef.current;
      setGenerating(true);
      setProgress(0.04);
      setError(null);
      try {
        const result = await renderLineArt({
          photo,
          settings: target,
          onProgress: (value) => {
            if (run === runRef.current) setProgress(value);
          },
        });
        if (run !== runRef.current) return;
        await saveGeneration(draft.id, key, result.blob);
        setCachedKeys((current) =>
          current.includes(key) ? current : [...current, key],
        );
        await show(result.blob, key);
        patchDraft({ unlocked: false });
      } catch (caught) {
        if (run === runRef.current) {
          setError(
            caught instanceof Error
              ? caught.message
              : "La génération a échoué. Réessaie dans un instant.",
          );
        }
      } finally {
        if (run === runRef.current) setGenerating(false);
      }
    },
    [photo, draft, patchDraft, show],
  );

  // Récupère la photo déposée à l'étape précédente et l'état du cache.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      const blob = await getDraftPhoto();
      if (cancelled) return;
      if (!draft || !blob) {
        router.replace("/creer");
        return;
      }
      setPhoto(blob);
      setPhotoUrl(track(URL.createObjectURL(blob)));

      const known = await listGenerations(draft.id);
      if (cancelled) return;
      setCachedKeys(known);

      const key = settingsKey(draft.settings);
      const existing = await getGeneration(draft.id, key);
      if (cancelled || !existing) return;
      await show(existing, key);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Première génération automatique : l'utilisateur vient de cliquer
  // « Transformer ma photo », on ne lui demande pas de cliquer une fois de plus.
  useEffect(() => {
    if (!photo || !settings || engineReady !== true) return;
    if (master || generating || activeKey || cachedKeys.length > 0) return;
    void generate(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, engineReady, cachedKeys.length]);

  // Changement de réglages : si cette combinaison a déjà été générée, on la
  // réaffiche instantanément — aucun appel au modèle.
  useEffect(() => {
    if (!draft || !wanted || generating || unlocking) return;
    if (activeKey === wanted) return;
    let cancelled = false;
    (async () => {
      const cached = await getGeneration(draft.id, wanted);
      if (cancelled || !cached) return;
      await show(cached, wanted);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, draft?.id, generating, unlocking]);

  const unlock = useCallback(async () => {
    if (!master || !draft || !settings) return;
    if (!account.signedIn) {
      router.push("/connexion?next=/apercu");
      return;
    }

    setUnlocking(true);
    setProgress(0.25);
    setError(null);

    let consumed = false;
    try {
      // On prépare le fichier AVANT de débiter : un échec ne coûte rien.
      const artwork = await packageArtwork(master);
      setProgress(0.6);

      const response = await fetch("/api/credits/consume", { method: "POST" });
      if (response.status === 401) {
        router.push("/connexion?next=/apercu");
        return;
      }
      if (response.status === 402) {
        router.push("/debloquer");
        return;
      }
      if (!response.ok) throw new Error("Le débit du crédit a échoué.");
      consumed = true;

      const data = await response.json();
      setCredits(Number(data.credits ?? 0));

      await saveArtwork(draft.id, artwork.hd, artwork.thumb);
      addItem({
        id: draft.id,
        fileName: draft.fileName,
        createdAt: Date.now(),
        settings,
      });
      patchDraft({ unlocked: true });
      router.push(`/merci?id=${draft.id}`);
    } catch (caught) {
      if (consumed) {
        // Le crédit est parti mais l'enregistrement a échoué : on le rend.
        await fetch("/api/credits/consume", { method: "DELETE" }).catch(() => {});
        await useAppStore.getState().refreshAccount();
      }
      setUnlocking(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Le déblocage a échoué. Aucun crédit n'a été utilisé.",
      );
    }
  }, [
    master,
    draft,
    settings,
    account.signedIn,
    addItem,
    patchDraft,
    router,
    setCredits,
  ]);

  if (!hydrated || !draft || !settings) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="h-[60vh] animate-pulse rounded-card border-2 border-line bg-paper" />
      </div>
    );
  }

  const crop = settings.crop;
  const placeholderAspect = crop
    ? (draft.width * crop.width) / (draft.height * crop.height)
    : draft.width / draft.height;
  const stale = activeKey !== null && wanted !== null && activeKey !== wanted;
  const neverGenerated = activeKey === null;
  const busy = generating || unlocking;
  const canUnlock = Boolean(master) && !stale && !busy;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
      <section>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Voilà ton coloriage ✨
        </h1>
        <p className="mt-2 text-muted">
          Tire la poignée pour comparer avec ta photo.
        </p>

        <div className="mt-5 flex justify-center">
          <div
            className="relative max-w-full overflow-hidden rounded-card border-2 border-ink bg-white"
            style={
              displayUrl
                ? undefined
                : { aspectRatio: `${placeholderAspect}`, width: "100%" }
            }
          >
            {/* Cette image (invisible) donne ses dimensions au cadre : la
                hauteur reste bornée à l'écran quel que soit le format rendu. */}
            {displayUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt=""
                aria-hidden="true"
                className="block max-h-[70vh] w-auto max-w-full opacity-0"
              />
            )}

            {photoUrl && displayUrl ? (
              <div className="absolute inset-0">
                <BeforeAfter
                  className="h-full w-full"
                  beforeLabel="Ta photo"
                  afterLabel="Le coloriage"
                  before={
                    <div className="absolute inset-0 overflow-hidden bg-paper">
                      {/* le même recadrage que le dessin, en CSS */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt="Ta photo d'origine"
                        className="absolute max-w-none"
                        style={{
                          width: `${100 / (crop?.width ?? 1)}%`,
                          height: `${100 / (crop?.height ?? 1)}%`,
                          left: `${(-100 * (crop?.x ?? 0)) / (crop?.width ?? 1)}%`,
                          top: `${(-100 * (crop?.y ?? 0)) / (crop?.height ?? 1)}%`,
                        }}
                      />
                    </div>
                  }
                  after={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayUrl}
                      alt="Ta photo transformée en dessin au trait"
                      className="h-full w-full bg-white object-contain"
                    />
                  }
                />
              </div>
            ) : null}

            {busy && (
              <GeneratingOverlay
                progress={progress}
                label={unlocking ? "On prépare ton fichier…" : undefined}
              />
            )}
          </div>
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-tile border-2 border-line bg-paper p-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-grape" strokeWidth={2.2} />
          {WATERMARK_PREVIEW
            ? "Aperçu avec filigrane. Débloque la version HD pour imprimer."
            : "Filigrane désactivé (mode test) : clic droit sur l'image pour l'enregistrer."}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={2.2} />
            {error}
          </p>
        )}

        {engineReady === false && (
          <p
            role="alert"
            className="mt-3 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold"
          >
            Le moteur de génération n&apos;est pas disponible pour l&apos;instant.
            Réessaie plus tard — si tu administres ce site, renseigne{" "}
            <code className="font-mono">LITELLM_BASE_URL</code> et{" "}
            <code className="font-mono">LITELLM_API_KEY</code>, puis relance le
            serveur.
          </p>
        )}
      </section>

      <aside className="flex flex-col gap-5">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <Settings2 className="h-5 w-5 text-grape" strokeWidth={2} />
            Réglages
          </h2>

          <div className="space-y-5">
            <Segmented
              name="stroke"
              label="Épaisseur du trait"
              value={settings.stroke}
              disabled={busy}
              onChange={(value: StrokeWidth) =>
                setSettings({ ...settings, stroke: value })
              }
              options={(Object.keys(STROKE_LABELS) as StrokeWidth[]).map((key) => ({
                value: key,
                label: STROKE_LABELS[key].label,
              }))}
            />

            <Segmented
              name="detail"
              label="Niveau de détail"
              value={settings.detail}
              disabled={busy}
              onChange={(value: DetailLevel) =>
                setSettings({ ...settings, detail: value })
              }
              options={(Object.keys(DETAIL_LABELS) as DetailLevel[]).map((key) => ({
                value: key,
                label: DETAIL_LABELS[key].label,
                hint: DETAIL_LABELS[key].hint,
              }))}
            />

            <label className="flex items-start gap-3 rounded-tile border-2 border-line bg-paper p-3">
              <input
                type="checkbox"
                checked={Boolean(settings.removeBackground)}
                disabled={busy}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    removeBackground: event.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 accent-[var(--color-grape)]"
              />
              <span className="text-sm">
                <span className="flex items-center gap-1.5 font-bold">
                  <Scissors className="h-4 w-4 text-tangerine" strokeWidth={2.2} />
                  Effacer le décor
                </span>
                <span className="text-muted">
                  Ne garde que les personnages, sur fond blanc.
                </span>
              </span>
            </label>

            <div>
              <p className="mb-2 text-sm font-bold">Cadrage</p>
              <Button
                variant="ink"
                full
                disabled={busy}
                onClick={() => setCropOpen(true)}
              >
                <Crop className="h-4 w-4" strokeWidth={2.2} />
                Recadrer la photo
              </Button>
            </div>

            {/* Chaque génération est un appel au modèle : on la déclenche
                explicitement. Les combinaisons déjà essayées reviennent en
                revanche instantanément, sans repasser par ici. */}
            <div>
              <Button
                variant={stale || neverGenerated ? "primary" : "secondary"}
                full
                disabled={busy || engineReady !== true}
                onClick={() => void generate(settings)}
              >
                <RefreshCw
                  className={`h-4 w-4 ${generating ? "spin-slow" : ""}`}
                  strokeWidth={2.2}
                />
                {generating
                  ? "On dessine…"
                  : stale || neverGenerated
                    ? "Générer avec ces réglages"
                    : "Générer une autre version"}
              </Button>
              {stale && !generating && (
                <p className="mt-2 text-xs font-semibold text-tangerine">
                  Cette combinaison n&apos;a pas encore été dessinée.
                </p>
              )}
              {cachedKeys.length > 1 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <Sparkles className="h-3.5 w-3.5 text-grape" strokeWidth={2.2} />
                  {cachedKeys.length} versions en mémoire : y revenir est
                  instantané.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card tone="grape" className="border-4 p-5">
          {!account.signedIn ? (
            <>
              <p className="font-display text-lg font-bold">
                Débloque la version imprimable
              </p>
              <p className="mt-1 text-sm text-muted">
                Connecte-toi pour acheter des crédits et retrouver tes coloriages.
              </p>
              <ButtonLink
                href="/connexion?next=/apercu"
                full
                size="lg"
                className="mt-4"
              >
                <LogIn className="h-5 w-5" strokeWidth={2.2} />
                Se connecter
              </ButtonLink>
            </>
          ) : account.credits > 0 ? (
            <>
              <p className="font-display text-lg font-bold">
                Il te reste {account.credits}{" "}
                {account.credits > 1 ? "crédits" : "crédit"}.
              </p>
              <p className="mt-1 text-sm text-muted">
                Tu récupères exactement le dessin affiché, en fichier imprimable.
              </p>
              <Button
                full
                size="lg"
                className="mt-4"
                onClick={unlock}
                disabled={!canUnlock}
              >
                <Unlock className="h-5 w-5" strokeWidth={2.2} />
                {unlocking ? "On prépare le fichier…" : "Débloquer en HD"}
              </Button>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold">
                Débloque la version imprimable
              </p>
              <p className="mt-1 text-sm text-muted">
                PDF haute définition, format A4, sans filigrane.
              </p>
              <ButtonLink href="/debloquer" full size="lg" className="mt-4">
                <Lock className="h-5 w-5" strokeWidth={2.2} />
                Débloquer en HD — {soloPrice}
              </ButtonLink>
            </>
          )}

          <Link
            href="/creer"
            className="mt-3 block text-center text-sm font-semibold text-grape underline decoration-2 underline-offset-4"
          >
            Essayer une autre photo
          </Link>
        </Card>
      </aside>

      {cropOpen && photoUrl && (
        <CropDialog
          photoUrl={photoUrl}
          imageWidth={draft.width}
          imageHeight={draft.height}
          initial={settings.crop}
          onCancel={() => setCropOpen(false)}
          onApply={(next: CropRect) => {
            const full = next.width >= 0.999 && next.height >= 0.999;
            setSettings({ ...settings, crop: full ? undefined : next });
            setCropOpen(false);
          }}
        />
      )}
    </div>
  );
}
