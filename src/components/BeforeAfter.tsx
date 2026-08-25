"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { MoveHorizontal } from "lucide-react";
import { cx } from "@/lib/cx";

interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  initial?: number;
}

/** Comparateur avant/après : on tire la poignée pour révéler le dessin. */
export function BeforeAfter({
  before,
  after,
  beforeLabel = "Photo",
  afterLabel = "Coloriage",
  className,
  initial = 50,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(initial);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = useCallback((clientX: number) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cx("relative select-none overflow-hidden", className)}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromEvent(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging.current) updateFromEvent(event.clientX);
      }}
      onPointerUp={(event) => {
        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
    >
      <div className="absolute inset-0">{before}</div>
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        {after}
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-bold text-white">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-grape px-2.5 py-1 text-xs font-bold text-white">
        {afterLabel}
      </span>

      <div
        className="absolute inset-y-0 w-1 bg-ink"
        style={{ left: `calc(${position}% - 2px)` }}
      >
        <button
          type="button"
          role="slider"
          aria-label="Comparer la photo et le coloriage"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft")
              setPosition((p) => Math.max(0, p - 5));
            if (event.key === "ArrowRight")
              setPosition((p) => Math.min(100, p + 5));
          }}
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-ink bg-white shadow-[0_2px_0_0_rgba(32,27,46,0.25)]"
        >
          <MoveHorizontal className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
