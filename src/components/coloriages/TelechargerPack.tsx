"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { suivre } from "@/lib/analytics";
import { downloadBlob, loadBitmap } from "@/lib/image";
import { buildColoringPackPdf } from "@/lib/pdf";

/**
 * Tous les dessins publiés d'un thème en un seul PDF A4, une page par dessin,
 * dans l'ordre de la grille du hub.
 *
 * Fabriqué dans le navigateur à partir des images déjà servies, avec la mise
 * en page du PDF d'une fiche. Une image est décodée à la fois puis libérée.
 * Si une image manque, aucun PDF ne sort : un cahier troué sans prévenir
 * serait pire qu'un message d'erreur.
 */
export function TelechargerPack({
  theme,
  dessins,
  nomFichier,
}: {
  /** Pour la mesure : quel thème est téléchargé en pack. */
  theme: string;
  /** Dans l'ordre de la grille. */
  dessins: { src: string; titre: string }[];
  nomFichier: string;
}) {
  const [enCours, setEnCours] = useState<number | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const telecharger = async () => {
    // Compté au clic, comme le bouton d'une fiche : c'est l'intention qu'on mesure.
    suivre("coloriage-telecharge", { format: "pack", slug: theme });
    setEnCours(0);
    setErreur(null);
    let dessinCourant = "";
    try {
      const pdf = await buildColoringPackPdf(dessins.length, async (index) => {
        const dessin = dessins[index];
        dessinCourant = dessin.titre;
        setEnCours(index + 1);
        const reponse = await fetch(dessin.src);
        if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
        const image = await reponse.blob();
        const bitmap = await loadBitmap(image);
        const { width, height } = bitmap;
        bitmap.close?.();
        return { image, width, height };
      });
      downloadBlob(pdf, `${nomFichier}.pdf`);
    } catch {
      setErreur(
        `Le dessin « ${dessinCourant} » n'a pas pu être chargé : aucun PDF n'a été créé. Réessaie dans un instant.`,
      );
    } finally {
      setEnCours(null);
    }
  };

  return (
    <div>
      <Button
        size="lg"
        onClick={() => void telecharger()}
        disabled={enCours !== null}
      >
        <Download className="h-5 w-5" strokeWidth={2.2} />
        {enCours !== null
          ? `Préparation… ${enCours} / ${dessins.length}`
          : `Télécharger les ${dessins.length} coloriages (PDF A4)`}
      </Button>
      {erreur && (
        <p role="alert" className="mt-2 text-sm font-semibold text-error">
          {erreur}
        </p>
      )}
    </div>
  );
}
