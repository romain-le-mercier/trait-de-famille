import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Où vivent les fichiers des coloriages.
 *
 * Un volume monté, pas le système de fichiers du conteneur : celui-ci
 * disparaît à chaque redéploiement. La sauvegarde du volume vers S3 est
 * affaire d'hébergeur, pas d'application.
 *
 * Tout passe par ce module, et rien d'autre ne connaît de chemin. C'est ce qui
 * permettra de basculer vers un stockage objet en ne touchant qu'un fichier :
 * les quatre fonctions ci-dessous sont toute la surface.
 */

const RACINE = process.env.STOCKAGE_DIR ?? path.join(process.cwd(), ".donnees");
const OEUVRES = path.join(RACINE, "oeuvres");

/**
 * Les identifiants viennent d'une URL : les valider n'est pas une précaution
 * de style. Sans ça, `../../.env` serait un identifiant recevable.
 */
const ID_VALIDE = /^[A-Za-z0-9_-]{6,64}$/;

function chemin(id: string): string {
  if (!ID_VALIDE.test(id)) throw new Error(`Identifiant d'œuvre invalide : ${id}`);
  // Deux niveaux de répartition : un répertoire de dizaines de milliers
  // d'entrées est pénible à lister comme à sauvegarder.
  return path.join(OEUVRES, id.slice(0, 2), id);
}

export async function ecrire(id: string, donnees: Buffer): Promise<void> {
  const cible = chemin(id);
  await mkdir(path.dirname(cible), { recursive: true });
  // Écriture puis renommage : un fichier n'apparaît que complet. Sans ça, une
  // coupure au mauvais moment laisserait une œuvre tronquée mais référencée
  // en base, donc facturable.
  const provisoire = `${cible}.partiel`;
  await writeFile(provisoire, donnees);
  const { rename } = await import("node:fs/promises");
  await rename(provisoire, cible);
}

export async function lire(id: string): Promise<Buffer | null> {
  try {
    return await readFile(chemin(id));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function supprimer(id: string): Promise<void> {
  await rm(chemin(id), { force: true });
}

/** Utile aux journaux de démarrage : dire où l'on écrit évite bien des doutes. */
export function racineStockage(): string {
  return OEUVRES;
}
