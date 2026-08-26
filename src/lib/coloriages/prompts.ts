import type { DetailLevel } from "@/lib/lineart/types";

/**
 * Prompts de la bibliothèque : **texte → dessin au trait**.
 *
 * Volontairement séparés de ceux de `api/generate`, qui convertissent une
 * photo. Les contraintes de sortie se ressemblent, mais la tâche est
 * différente : là-bas il faut préserver une ressemblance, ici il faut inventer
 * une composition. Les mélanger reviendrait à dégrader les deux à chaque
 * réglage.
 *
 * Les consignes de format ne sont pas décoratives. Un aplat gris, une ombre ou
 * une zone ouverte rendent le dessin inutilisable : un enfant ne peut pas
 * colorier ce qui n'est pas fermé, et une imprimante noir et blanc transforme
 * une trame en bouillie.
 */

const BASE = [
  "Dessine une page de coloriage pour enfants, en noir et blanc.",
  "Uniquement des contours noirs nets sur fond blanc pur.",
  "Aucun aplat gris, aucune ombre, aucun dégradé, aucune trame, aucune hachure.",
  "Toutes les zones doivent être entièrement fermées pour pouvoir être coloriées.",
  "Le sujet est centré, entier, et occupe la majeure partie de la page.",
  "Aucun texte, aucun mot, aucune signature, aucun cadre ni bordure.",
  "Format portrait, proportions d'une feuille A4.",
].join(" ");

const DETAIL: Record<DetailLevel, string> = {
  "tout-petit":
    "Très peu de détails : de grandes zones simples, un trait épais et régulier, " +
    "adapté à un enfant de 3 ans qui tient encore mal son feutre.",
  enfant:
    "Niveau de détail moyen : des zones bien lisibles, ni minuscules ni vides, " +
    "et un trait d'épaisseur moyenne.",
  ado:
    "Détail soutenu : motifs et textures dessinés au trait fin, mais chaque zone " +
    "reste fermée et assez grande pour être coloriée.",
};

/** Le prompt envoyé au modèle pour un sujet de la bibliothèque. */
export function promptColoriage(sujet: string, difficulte: DetailLevel): string {
  return `${BASE} Sujet : ${sujet}. ${DETAIL[difficulte]}`;
}
