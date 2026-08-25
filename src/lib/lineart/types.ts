/** Niveau de détail — exposé à l'utilisateur comme « pour qui ? ». */
export type DetailLevel = "tout-petit" | "enfant" | "ado";

/** Épaisseur du trait. */
export type StrokeWidth = "fin" | "moyen" | "epais";

export interface LineArtSettings {
  detail: DetailLevel;
  stroke: StrokeWidth;
  /** Efface le décor pour ne garder que les personnages sur fond blanc. */
  removeBackground?: boolean;
  /** Rectangle de recadrage normalisé (0..1) dans l'image source. */
  crop?: CropRect;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_SETTINGS: LineArtSettings = {
  detail: "enfant",
  stroke: "moyen",
};

export const DETAIL_LABELS: Record<DetailLevel, { label: string; hint: string }> = {
  "tout-petit": { label: "Tout-petit", hint: "Grandes zones, peu de détails" },
  enfant: { label: "Enfant", hint: "L'équilibre, le plus demandé" },
  ado: { label: "Ado & adultes", hint: "Tous les détails du visage" },
};

export const STROKE_LABELS: Record<StrokeWidth, { label: string }> = {
  fin: { label: "Fin" },
  moyen: { label: "Moyen" },
  epais: { label: "Épais" },
};

export type ProgressFn = (ratio: number) => void;

/**
 * Taille max de la photo envoyée au modèle. Assez grand pour qu'il voie les
 * visages, assez petit pour que l'upload reste rapide. La résolution du
 * résultat, elle, est décidée par le modèle.
 */
export const INPUT_MAX_SIDE = 1536;

/**
 * Signature d'un jeu de réglages. Sert à la fois à savoir si le dessin
 * affiché est à jour et de clé de cache : une combinaison déjà générée est
 * réaffichée sans rappeler le modèle.
 */
export function settingsKey(settings: LineArtSettings): string {
  const crop = settings.crop
    ? [settings.crop.x, settings.crop.y, settings.crop.width, settings.crop.height]
        .map((value) => value.toFixed(4))
        .join(",")
    : "full";
  return [
    settings.detail,
    settings.stroke,
    settings.removeBackground ? "nobg" : "bg",
    crop,
  ].join("|");
}

export function sameSettings(a: LineArtSettings, b: LineArtSettings): boolean {
  return settingsKey(a) === settingsKey(b);
}
