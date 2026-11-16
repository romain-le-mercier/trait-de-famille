"use client";

import { useState } from "react";
import { Download, FileImage, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { suivre } from "@/lib/analytics";
import { downloadBlob, loadBitmap } from "@/lib/image";
import { buildColoringCardPdf, buildColoringPdf } from "@/lib/pdf";

type Format = "pdf" | "image" | "carte";

/**
 * Téléchargement d'un coloriage de la bibliothèque.
 *
 * Le PDF est fabriqué dans le navigateur, avec exactement le code qui sert
 * aux coloriages payants (`buildColoringPdf`) : même mise en page A4, mêmes
 * marges. Rien à générer ni à stocker côté serveur. Avec `carte`, un
 * troisième bouton donne le même dessin en carte de vœux à plier
 * (`buildColoringCardPdf`).
 */
export function TelechargerColoriage({
  slug,
  src,
  nomFichier,
  extension,
  carte = false,
}: {
  /** Pour la mesure : quel coloriage de la bibliothèque est téléchargé. */
  slug: string;
  src: string;
  nomFichier: string;
  /** Celle du fichier réellement stocké : le modèle décide du format. */
  extension: string;
  /** Propose aussi la carte à plier (thème Noël seulement). */
  carte?: boolean;
}) {
  const [enCours, setEnCours] = useState<null | Format>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const telecharger = async (format: Format) => {
    // Compté au clic, pas à la réussite : c'est l'intention qu'on mesure.
    suivre("coloriage-telecharge", {
      format: format === "image" ? extension : format,
      slug,
    });
    setEnCours(format);
    setErreur(null);
    try {
      const image = await (await fetch(src)).blob();
      if (format === "image") {
        downloadBlob(image, `${nomFichier}.${extension}`);
        return;
      }
      const bitmap = await loadBitmap(image);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close?.();
      if (format === "carte") {
        const pdf = await buildColoringCardPdf(image, dimensions);
        downloadBlob(pdf, `${nomFichier}-carte-a-plier.pdf`);
        return;
      }
      const pdf = await buildColoringPdf(image, dimensions);
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
      {carte && (
        <Button
          size="lg"
          variant="ink"
          className="mt-2 w-full"
          onClick={() => void telecharger("carte")}
          disabled={enCours !== null}
        >
          <Mail className="h-5 w-5" strokeWidth={2.2} />
          {enCours === "carte" ? "Préparation…" : "Carte à plier (PDF)"}
        </Button>
      )}
      {erreur && (
        <p role="alert" className="mt-2 text-sm font-semibold text-error">
          {erreur}
        </p>
      )}
    </div>
  );
}
