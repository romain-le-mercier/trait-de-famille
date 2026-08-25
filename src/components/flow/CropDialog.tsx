"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crop, Maximize, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import type { CropRect } from "@/lib/lineart/types";

const RATIOS = [
  { id: "a4p", label: "A4 portrait", value: 210 / 297 },
  { id: "a4l", label: "A4 paysage", value: 297 / 210 },
  { id: "square", label: "Carré", value: 1 },
  { id: "full", label: "Photo entière", value: 0 },
] as const;

/**
 * Hauteur approximative de tout ce qui entoure le cadre dans le panneau
 * (titre, formats, zoom, boutons, marges). Sert à borner la largeur du cadre
 * pour qu'il tienne dans la fenêtre sans faire défiler le panneau.
 */
const PANEL_CHROME_PX = 400;

interface CropDialogProps {
  photoUrl: string;
  imageWidth: number;
  imageHeight: number;
  initial?: CropRect;
  onCancel: () => void;
  onApply: (crop: CropRect) => void;
}

type RatioId = (typeof RATIOS)[number]["id"];

/** Le format prédéfini le plus proche d'un recadrage déjà appliqué. */
function matchRatioId(
  crop: CropRect | undefined,
  imageWidth: number,
  imageHeight: number,
): RatioId {
  if (!crop) return "a4p";
  const target = (crop.width * imageWidth) / (crop.height * imageHeight);
  let best: RatioId = "full";
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const item of RATIOS) {
    const delta = Math.abs((item.value || imageWidth / imageHeight) - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = item.id;
    }
  }
  return best;
}

/** Recadrage : on déplace la photo dans le cadre, on zoome, on valide. */
export function CropDialog({
  photoUrl,
  imageWidth,
  imageHeight,
  initial,
  onCancel,
  onApply,
}: CropDialogProps) {
  const [ratioId, setRatioId] = useState<RatioId>(() =>
    matchRatioId(initial, imageWidth, imageHeight),
  );
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const ratio =
    RATIOS.find((item) => item.id === ratioId)?.value || imageWidth / imageHeight;

  // On mesure le cadre, on ne le dimensionne pas : c'est `aspect-ratio` qui
  // décide de sa hauteur. Écrire cette hauteur en JS à partir d'une mesure de
  // largeur crée une boucle — hauteur → débordement → barre de défilement →
  // largeur → hauteur… — et la modale oscille sans fin.
  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      setViewport((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const baseScale =
    viewport.width && viewport.height
      ? Math.max(viewport.width / imageWidth, viewport.height / imageHeight)
      : 1;
  const scale = baseScale * zoom;
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  /** Garde la photo collée aux bords du cadre, pour une échelle donnée. */
  const clampAt = (value: { x: number; y: number }, at: number) => ({
    x: Math.min(0, Math.max(viewport.width - imageWidth * at, value.x)),
    y: Math.min(0, Math.max(viewport.height - imageHeight * at, value.y)),
  });
  const clamp = (value: { x: number; y: number }) => clampAt(value, scale);

  /** Le recadrage reçu en `initial` n'a pas encore été rejoué. */
  const restored = useRef(false);
  /** Le prochain placement doit recentrer (ouverture nette, changement de format). */
  const recenter = useRef(true);

  // Placement de la photo dans le cadre. Trois cas, dans l'ordre : rejouer le
  // recadrage précédent à l'ouverture, recentrer, ou simplement re-borner.
  useEffect(() => {
    if (!viewport.width || !viewport.height) return;

    // Changer de format met à jour `ratio` avant que le ResizeObserver n'ait
    // re-mesuré le cadre. Placer la photo sur ces dimensions périmées la
    // décentrerait : on attend que la mesure corresponde au format demandé.
    const stale = Math.abs(viewport.width / viewport.height - ratio) > 0.01;
    if (stale && (recenter.current || !restored.current)) return;

    if (!restored.current) {
      restored.current = true;
      if (initial) {
        recenter.current = false;
        // apply() fait `width = viewport.width / scale / imageWidth` ;
        // on inverse pour retrouver l'échelle, donc le zoom, donc l'offset.
        const wanted = viewport.width / (initial.width * imageWidth);
        const nextZoom = Math.min(3, Math.max(1, wanted / baseScale));
        const at = baseScale * nextZoom;
        setZoom(nextZoom);
        setOffset(
          clampAt(
            {
              x: -initial.x * at * imageWidth,
              y: -initial.y * at * imageHeight,
            },
            at,
          ),
        );
        return;
      }
    }

    if (recenter.current) {
      recenter.current = false;
      setOffset({
        x: (viewport.width - displayWidth) / 2,
        y: (viewport.height - displayHeight) / 2,
      });
      return;
    }

    setOffset((current) => clampAt(current, scale));
    // `ratio` est dans les dépendances pour qu'un changement de format
    // consomme toujours le recentrage, même si le cadre garde ses dimensions
    // (photo carrée, « Carré » et « Photo entière » donnent le même cadre).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.height, displayWidth, displayHeight, ratio]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const apply = () => {
    if (!viewport.width || !scale) return onApply({ x: 0, y: 0, width: 1, height: 1 });
    const x = -offset.x / scale / imageWidth;
    const y = -offset.y / scale / imageHeight;
    const width = viewport.width / scale / imageWidth;
    const height = viewport.height / scale / imageHeight;
    onApply({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      width: Math.max(0.05, Math.min(1 - Math.max(0, x), width)),
      height: Math.max(0.05, Math.min(1 - Math.max(0, y), height)),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Recadrer la photo"
    >
      {/* La gouttière de défilement est réservée en permanence : la largeur du
          contenu ne dépend plus de l'apparition d'une barre. */}
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-card border-2 border-ink bg-canvas p-5"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Crop className="h-5 w-5 text-grape" strokeWidth={2} />
            Recadrer
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-ink p-1.5 hover:bg-paper"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {RATIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === ratioId) return;
                recenter.current = true;
                setRatioId(item.id);
                setZoom(1);
              }}
              className={cx(
                "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors",
                ratioId === item.id
                  ? "border-ink bg-grape text-white"
                  : "border-line text-muted hover:border-ink hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          ref={frameRef}
          className="relative mx-auto w-full cursor-grab overflow-hidden rounded-tile border-2 border-ink bg-paper active:cursor-grabbing"
          style={{
            aspectRatio: `${ratio}`,
            maxWidth: `calc((100dvh - ${PANEL_CHROME_PX}px) * ${ratio})`,
          }}
          onPointerDown={(event) => {
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              ox: offset.x,
              oy: offset.y,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start) return;
            setOffset(
              clamp({
                x: start.ox + (event.clientX - start.x),
                y: start.oy + (event.clientY - start.y),
              }),
            );
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
        >
          {/* max-w-none est indispensable : le reset Tailwind applique
              max-width:100% aux images, ce qui écraserait la largeur calculée. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              width: displayWidth,
              height: displayHeight,
              left: offset.x,
              top: offset.y,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 border border-white/60"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.35) 1px, transparent 1px)",
              backgroundSize: "33.33% 33.33%",
            }}
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm font-bold">
          <ZoomIn className="h-4 w-4 text-grape" strokeWidth={2.2} />
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="h-2 flex-1 accent-[var(--color-grape)]"
          />
        </label>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button onClick={apply} full>
            <Crop className="h-4 w-4" strokeWidth={2.2} />
            Appliquer le recadrage
          </Button>
          <Button
            variant="ink"
            full
            onClick={() => onApply({ x: 0, y: 0, width: 1, height: 1 })}
          >
            <Maximize className="h-4 w-4" strokeWidth={2.2} />
            Photo entière
          </Button>
        </div>
      </div>
    </div>
  );
}
