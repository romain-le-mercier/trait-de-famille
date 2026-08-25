"use client";

import { useCallback, useRef, useState } from "react";
import { ImageUp, Loader2, RefreshCw } from "lucide-react";
import { ACCEPTED_TYPES, checkImageFile, formatBytes } from "@/lib/image";

interface DropzoneProps {
  onFile: (file: File) => void;
  onError: (message: string) => void;
  busy?: boolean;
  current?: { name: string; size: number; url: string } | null;
}

export function Dropzone({ onFile, onError, busy, current }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const check = checkImageFile(file);
      if (!check.ok) {
        onError(check.message ?? "Cette image n'a pas fonctionné.");
        return;
      }
      onFile(file);
    },
    [onFile, onError],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Ajouter une photo"
        data-active={dragging ? "true" : "false"}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handle(event.dataTransfer.files?.[0]);
        }}
        onPaste={(event) => {
          const file = event.clipboardData.files?.[0];
          if (file) handle(file);
        }}
        className="dashed-frame flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-card p-6 text-center transition-colors hover:bg-paper"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            handle(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {busy ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-grape" strokeWidth={1.8} />
            <p className="font-bold">On regarde ta photo…</p>
          </>
        ) : current ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt="Aperçu de la photo choisie"
              className="max-h-40 rounded-tile border-2 border-ink object-contain"
            />
            <p className="font-bold">{current.name}</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted">
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
              {formatBytes(current.size)} · clique pour changer de photo
            </p>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-grape-soft">
              <ImageUp className="h-7 w-7 text-grape" strokeWidth={1.8} />
            </span>
            <p className="font-display text-xl font-semibold">
              Glisse ta photo ici ou clique pour parcourir
            </p>
            <p className="text-sm text-muted">JPG, PNG ou WebP · jusqu&apos;à 10 Mo</p>
          </>
        )}
      </div>
    </div>
  );
}
