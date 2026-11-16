import type { jsPDF as JsPdf } from "jspdf";

const PIED_DE_PAGE = "Trait de Famille — imprime, colorie, recommence.";

/** Génère le PDF A4 imprimable à partir du PNG haute définition. */
export async function buildColoringPdf(
  image: Blob,
  options: { width: number; height: number; label?: string },
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const landscape = options.width > options.height;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: landscape ? "landscape" : "portrait",
    compress: true,
  });

  await dessinerPage(doc, image, options);

  return doc.output("blob");
}

/**
 * Un PDF A4 de plusieurs pages, une par image, avec la mise en page de
 * `buildColoringPdf` (marges, centrage, pied de page, orientation par image).
 *
 * Les images arrivent une à une : `charger(index)` n'est appelé qu'une fois la
 * page précédente posée, pour ne garder qu'une image décodée à la fois.
 */
export async function buildColoringPackPdf(
  nombre: number,
  charger: (
    index: number,
  ) => Promise<{ image: Blob; width: number; height: number }>,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  let doc: JsPdf | null = null;

  for (let index = 0; index < nombre; index++) {
    const page = await charger(index);
    const orientation = page.width > page.height ? "landscape" : "portrait";
    if (!doc) {
      doc = new jsPDF({ unit: "mm", format: "a4", orientation, compress: true });
    } else {
      doc.addPage("a4", orientation);
    }
    await dessinerPage(doc, page.image, page);
  }

  if (!doc) throw new Error("Aucune page à assembler.");
  return doc.output("blob");
}

async function dessinerPage(
  doc: JsPdf,
  image: Blob,
  options: { width: number; height: number; label?: string },
): Promise<void> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const footer = 8;

  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2 - footer;
  const ratio = Math.min(maxWidth / options.width, maxHeight / options.height);
  const drawWidth = options.width * ratio;
  const drawHeight = options.height * ratio;
  const x = (pageWidth - drawWidth) / 2;
  const y = (pageHeight - footer - drawHeight) / 2;

  const dataUrl = await blobToDataUrl(image);
  doc.addImage(dataUrl, "PNG", x, y, drawWidth, drawHeight, undefined, "FAST");

  doc.setFontSize(7);
  doc.setTextColor(170, 165, 180);
  doc.text(options.label ?? PIED_DE_PAGE, pageWidth / 2, pageHeight - margin / 2, {
    align: "center",
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
