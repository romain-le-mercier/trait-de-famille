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

/**
 * Une carte de vœux à plier : A4 paysage plié en deux dans la largeur.
 * Le dessin occupe la moitié droite (la face), la moitié gauche (le dos) ne
 * porte que le pied de page, l'intérieur reste vierge pour écrire à la main.
 * Un trait de pliage fin et clair marque le milieu.
 */
export async function buildColoringCardPdf(
  image: Blob,
  options: { width: number; height: number; label?: string },
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pli = pageWidth / 2;

  // Marge plus large côté pli : un pliage approximatif ne doit pas mordre le dessin.
  await dessinerPage(doc, image, options, {
    x: pli + 6,
    y: 0,
    width: pli - 6,
    height: pageHeight,
    // Le pied de page est au dos : rien à réserver sous le dessin.
    piedDePage: { x: pli / 2, reserve: 0 },
  });

  doc.setDrawColor(215, 210, 222);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(pli, 4, pli, pageHeight - 4);

  return doc.output("blob");
}

/**
 * Pose une image centrée dans une zone de la page (toute la page par défaut),
 * avec marge et pied de page. Le pied de page est centré sous la zone, sauf si
 * une abscisse est imposée (la carte le met au dos, pas sous le dessin).
 */
async function dessinerPage(
  doc: JsPdf,
  image: Blob,
  options: { width: number; height: number; label?: string },
  zone?: {
    x: number;
    y: number;
    width: number;
    height: number;
    piedDePage?: { x: number; reserve: number };
  },
): Promise<void> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cadre = zone ?? { x: 0, y: 0, width: pageWidth, height: pageHeight };
  const margin = 10;
  const footer = zone?.piedDePage?.reserve ?? 8;

  const maxWidth = cadre.width - margin * 2;
  const maxHeight = cadre.height - margin * 2 - footer;
  const ratio = Math.min(maxWidth / options.width, maxHeight / options.height);
  const drawWidth = options.width * ratio;
  const drawHeight = options.height * ratio;
  const x = cadre.x + (cadre.width - drawWidth) / 2;
  const y = cadre.y + (cadre.height - footer - drawHeight) / 2;

  const dataUrl = await blobToDataUrl(image);
  doc.addImage(dataUrl, "PNG", x, y, drawWidth, drawHeight, undefined, "FAST");

  doc.setFontSize(7);
  doc.setTextColor(170, 165, 180);
  doc.text(
    options.label ?? PIED_DE_PAGE,
    zone?.piedDePage?.x ?? cadre.x + cadre.width / 2,
    cadre.y + cadre.height - margin / 2,
    { align: "center" },
  );
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
