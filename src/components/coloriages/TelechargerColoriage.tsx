"use client";

import { useState } from "react";
import { Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadBlob, loadBitmap } from "@/lib/image";
import { buildColoringPdf } from "@/lib/pdf";

/**
 * Téléchargement d'un coloriage de la bibliothèque.
 *
 * Le PDF est fabriqué dans le navigateur, avec exactement le code qui sert
 * aux coloriages payants (`buildColoringPdf`) : même mise en page A4, mêmes
 * marges. Rien à générer ni à stocker côté serveur.
 */
export function TelechargerColoriage({
  src,
  nomFichier,
  extension,
}: {
  src: string;
  nomFichier: string;
  /** Celle du fichier réellement stocké : le modèle décide du format. */
  extension: string;
}) {
  const [enCours, setEnCours] = useState<null | "pdf" | "image">(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const telecharger = async (format: "pdf" | "image") => {
    setEnCours(format);
    setErreur(null);
    try {
      const image = await (await fetch(src)).blob();
      if (format === "image") {
        downloadBlob(image, `${nomFichier}.${extension}`);
        return;
      }
      const bitmap = await loadBitmap(image);
      const pdf = await buildColoringPdf(image, {
        width: bitmap.width,
        height: bitmap.height,
      });
      bitmap.close?.();
      downloadBlob(pdf, `${nomFichier}.pdf`);
    } catch {
      setErreur("Le téléchargement a échoué. Réessaie dans un instant.");
    } finally {
      setEnCours(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          onClick={() => void telecharger("pdf")}
          disabled={enCours !== null}
        >
          <Download className="h-5 w-5" strokeWidth={2.2} />
          {enCours === "pdf" ? "Préparation…" : "Télécharger en PDF (A4)"}
        </Button>
        <Button
          size="lg"
          variant="ink"
          onClick={() => void telecharger("image")}
          disabled={enCours !== null}
        >
          <FileImage className="h-4 w-4" strokeWidth={2.2} />
          {enCours === "image" ? "…" : extension.toUpperCase()}
        </Button>
      </div>
      {erreur && (
        <p role="alert" className="mt-2 text-sm font-semibold text-error">
          {erreur}
        </p>
      )}
    </div>
  );
}
