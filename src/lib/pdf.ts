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
  doc.text(
    options.label ?? "Trait de Famille — imprime, colorie, recommence.",
    pageWidth / 2,
    pageHeight - margin / 2,
    { align: "center" },
  );

  return doc.output("blob");
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
