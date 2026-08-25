"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

const MESSAGES = [
  "On affûte les crayons…",
  "On trace les contours…",
  "On prépare la feuille…",
];

export function GeneratingOverlay({
  progress,
  label,
}: {
  progress: number;
  label?: string;
}) {
  const [index, setIndex] = useState(0);
  const [creep, setCreep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % MESSAGES.length),
      1600,
    );
    return () => clearInterval(timer);
  }, []);

  // La génération distante peut prendre une dizaine de secondes sans étape
  // intermédiaire : on fait avancer la barre pour qu'elle ne semble pas figée.
  useEffect(() => {
    const timer = setInterval(
      () => setCreep((value) => value + (0.9 - value) * 0.06),
      400,
    );
    return () => clearInterval(timer);
  }, []);

  const shown = Math.max(progress, creep);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-canvas/92 backdrop-blur-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-grape-soft">
        <Pencil className="h-7 w-7 -rotate-45 text-grape pulse-soft" strokeWidth={1.8} />
      </span>
      <p className="font-display text-lg font-semibold" aria-live="polite">
        {label ?? MESSAGES[index]}
      </p>
      <div className="h-2 w-48 overflow-hidden rounded-full border-2 border-ink bg-white">
        <div
          className="h-full rounded-full bg-grape transition-[width] duration-300"
          style={{ width: `${Math.round(Math.min(1, Math.max(0.04, shown)) * 100)}%` }}
        />
      </div>
    </div>
  );
}
