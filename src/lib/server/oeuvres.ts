import { getPool } from "./pool";
import { supprimer as supprimerFichier } from "./stockage";

/**
 * Les coloriages personnalisés : qui les possède, et lesquels sont payés.
 *
 * Les octets vivent sur le volume (`stockage.ts`) ; cette table ne porte que
 * ce qui doit être interrogeable et sauvegardé avec le reste de la base.
 */

/** Un essai jamais débloqué est effacé au bout de ce délai. */
export const JOURS_AVANT_EXPIRATION = 30;

export interface Oeuvre {
  id: string;
  proprietaire: string;
  mime: string;
  largeur: number;
  hauteur: number;
  debloquee: boolean;
}

interface Ligne {
  id: string;
  proprietaire: string;
  mime: string;
  largeur: number;
  hauteur: number;
  debloquee_le: Date | null;
}

const versOeuvre = (l: Ligne): Oeuvre => ({
  id: l.id,
  proprietaire: l.proprietaire,
  mime: l.mime,
  largeur: l.largeur,
  hauteur: l.hauteur,
  debloquee: l.debloquee_le !== null,
});

export interface NouvelleOeuvre {
  id: string;
  proprietaire: string;
  mime: string;
  largeur: number;
  hauteur: number;
  octets: number;
  nomFichier?: string | null;
  empreintePhoto?: string | null;
  reglages?: unknown;
}

export async function creer(oeuvre: NouvelleOeuvre): Promise<void> {
  await getPool().query(
    `INSERT INTO oeuvres
       (id, proprietaire, mime, largeur, hauteur, octets,
        nom_fichier, empreinte_photo, reglages)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      oeuvre.id,
      oeuvre.proprietaire,
      oeuvre.mime,
      oeuvre.largeur,
      oeuvre.hauteur,
      oeuvre.octets,
      oeuvre.nomFichier ?? null,
      oeuvre.empreintePhoto ?? null,
      oeuvre.reglages === undefined ? null : JSON.stringify(oeuvre.reglages),
    ],
  );
}

export async function parId(id: string): Promise<Oeuvre | null> {
  const { rows } = await getPool().query<Ligne>(
    `SELECT id, proprietaire, mime, largeur, hauteur, debloquee_le
       FROM oeuvres WHERE id = $1`,
    [id],
  );
  return rows[0] ? versOeuvre(rows[0]) : null;
}

/**
 * Rattache à un compte un essai fait avant connexion.
 *
 * C'est ce qui rend l'entonnoir possible : on dessine sans compte, on se
 * connecte pour payer, et l'essai suit. La condition sur le propriétaire
 * actuel est la sécurité : on ne réclame que ce qu'on possédait déjà sous son
 * jeton anonyme.
 */
export async function reclamer(
  id: string,
  jetonAnonyme: string,
  compteId: string,
): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `UPDATE oeuvres SET proprietaire = $3
      WHERE id = $1 AND proprietaire = $2`,
    [id, `anon:${jetonAnonyme}`, `compte:${compteId}`],
  );
  return (rowCount ?? 0) > 0;
}

/**
 * Le marquage « payée » ne vit pas ici.
 *
 * Il est indissociable du débit du crédit : les deux doivent se faire ou
 * échouer ensemble, sinon une requête concurrente voit l'œuvre payée avant que
 * l'argent ne le soit et se sert gratuitement. La transaction qui tient les
 * deux est dans `accounts.ts`, avec le reste de l'argent : voir
 * `debiterPourDeblocage`.
 */

/**
 * Efface les essais jamais payés passé le délai.
 *
 * La ligne d'abord, le fichier ensuite — et le DELETE reprend la condition
 * `debloquee_le IS NULL` au lieu de faire confiance au SELECT qui l'a choisie :
 * entre les deux, l'essai a pu être payé, et l'effacer alors ferait disparaître
 * un coloriage dont le crédit vient d'être débité.
 *
 * Une fois la ligne partie, son fichier n'est plus promis à personne : une
 * coupure au mauvais moment ne laisse qu'un fichier orphelin, qui ne coûte que
 * de la place. C'est l'inverse — effacer le fichier d'une ligne encore vivante —
 * qui promettrait un coloriage qu'on ne peut plus livrer.
 */
export async function purgerEssaisExpires(): Promise<number> {
  const { rows } = await getPool().query<{ id: string }>(
    `DELETE FROM oeuvres
      WHERE id IN (
              SELECT id FROM oeuvres
               WHERE debloquee_le IS NULL
                 AND creee_le < now() - ($1 || ' days')::interval
               LIMIT 500
            )
        AND debloquee_le IS NULL
      RETURNING id`,
    [JOURS_AVANT_EXPIRATION],
  );
  if (rows.length === 0) return 0;

  for (const { id } of rows) {
    await supprimerFichier(id).catch((error) => {
      console.error("[oeuvres] fichier non supprimé", id, error);
    });
  }
  return rows.length;
}

/**
 * Purge opportuniste, une fois sur cinquante — même parti pris que pour les
 * quotas : pas de planificateur à installer et à surveiller pour un ménage
 * qui n'a aucune urgence.
 */
export async function purgerParfois(): Promise<void> {
  if (Math.random() > 0.02) return;
  try {
    const nombre = await purgerEssaisExpires();
    if (nombre > 0) console.log(`[oeuvres] ${nombre} essai(s) expiré(s) effacé(s)`);
  } catch (error) {
    console.error("[oeuvres] purge impossible", error);
  }
}
