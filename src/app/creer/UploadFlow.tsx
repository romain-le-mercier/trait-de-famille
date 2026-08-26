"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lightbulb, Lock, Wand2 } from "lucide-react";
import { Dropzone } from "@/components/flow/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { loadBitmap } from "@/lib/image";
import { makeId, newDraftSettings, useAppStore } from "@/lib/store";
import { clearDraft, saveDraftPhoto } from "@/lib/storage";

interface Picked {
  file: File;
  url: string;
  width: number;
  height: number;
}

const TIPS = [
  "Des visages nets et bien éclairés",
  "Une lumière du jour, sans contre-jour",
  "Un arrière-plan pas trop chargé",
];

export function UploadFlow() {
  const router = useRouter();
  const setDraft = useAppStore((s) => s.setDraft);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const bitmap = await loadBitmap(file);
      if (bitmap.width < 300 || bitmap.height < 300) {
        bitmap.close?.();
        setError(
          "Cette photo est trop petite pour un beau coloriage. Essaie une image d'au moins 300 px de côté.",
        );
        return;
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setPicked({ file, url, width: bitmap.width, height: bitmap.height });
      bitmap.close?.();
    } catch {
      setError("Cette image n'a pas fonctionné. Essaie une photo JPG ou PNG, plus nette.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!picked) return;
    setSubmitting(true);
    try {
      // Nouvelle photo : les dessins en cache ne la concernent plus.
      await clearDraft();
      await saveDraftPhoto(picked.file);
      setDraft({
        id: makeId(),
        fileName: picked.file.name,
        width: picked.width,
        height: picked.height,
        settings: newDraftSettings(),
        createdAt: Date.now(),
      });
      router.push("/apercu");
    } catch {
      setSubmitting(false);
      setError(
        "On n'a pas pu garder ta photo dans le navigateur. Vérifie que la navigation privée n'est pas trop restrictive.",
      );
    }
  };

  return (
    <div className="w-full max-w-xl">
      <Card className="p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold">Ajoute ta photo</h1>
        <p className="mt-2 text-muted">
          Une photo nette et bien éclairée donne le plus beau résultat.
        </p>

        <div className="mt-6">
          <Dropzone
            onFile={handleFile}
            onError={setError}
            busy={busy}
            current={
              picked
                ? { name: picked.file.name, size: picked.file.size, url: picked.url }
                : null
            }
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold text-ink"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={2.2} />
            {error}
          </p>
        )}

        <Card tone="soft" className="mt-6 bg-paper p-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Lightbulb className="h-4 w-4 text-tangerine" strokeWidth={2.2} />
            Pour un beau coloriage
          </p>
          <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-1">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-grape" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        <Button
          full
          size="lg"
          className="mt-6"
          disabled={!picked || submitting}
          onClick={submit}
        >
          <Wand2 className="h-5 w-5" strokeWidth={2.2} />
          {submitting ? "On y va…" : "Transformer ma photo"}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          Ta photo sert uniquement à produire ton coloriage.
        </p>
      </Card>
    </div>
  );
}
