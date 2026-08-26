import { getPool } from "./pool";

/**
 * Les dessins de la bibliothèque, en base.
 *
 * Seul l'état produit à l'exécution vit ici : le dessin, son statut, ses
 * dimensions. Le sujet — quoi dessiner, sous quel titre — reste dans le dépôt
 * (`src/lib/coloriages/themes.ts`).
 */

export type Statut = "brouillon" | "publie" | "rejete";

export interface Coloriage {
  slug: string;
  theme: string;
  statut: Statut;
  largeur: number;
  hauteur: number;
  /** Le format que le modèle a renvoyé : il décide de l'extension servie. */
  mime: string;
  genereLe: number;
  publieLe: number | null;
}

interface Row {
  slug: string;
  theme: string;
  statut: Statut;
  largeur: number;
  hauteur: number;
  mime: string;
  genere_le: Date;
  publie_le: Date | null;
}

function toColoriage(row: Row): Coloriage {
  return {
    slug: row.slug,
    theme: row.theme,
    statut: row.statut,
    largeur: row.largeur,
    hauteur: row.hauteur,
    mime: row.mime,
    genereLe: row.genere_le.getTime(),
    publieLe: row.publie_le?.getTime() ?? null,
  };
}

const CHAMPS = "slug, theme, statut, largeur, hauteur, mime, genere_le, publie_le";

/** Tous les dessins d'un thème, quel que soit leur statut. Pour l'admin. */
export async function listerParTheme(theme: string): Promise<Coloriage[]> {
  const { rows } = await getPool().query<Row>(
    `SELECT ${CHAMPS} FROM coloriages WHERE theme = $1 ORDER BY genere_le DESC`,
    [theme],
  );
  return rows.map(toColoriage);
}

/** Les dessins visibles du public. */
export async function listerPublies(theme?: string): Promise<Coloriage[]> {
  const { rows } = theme
    ? await getPool().query<Row>(
        `SELECT ${CHAMPS} FROM coloriages
          WHERE statut = 'publie' AND theme = $1
          ORDER BY publie_le DESC`,
        [theme],
      )
    : await getPool().query<Row>(
        `SELECT ${CHAMPS} FROM coloriages
          WHERE statut = 'publie'
          ORDER BY publie_le DESC`,
      );
  return rows.map(toColoriage);
}

export async function getColoriage(slug: string): Promise<Coloriage | null> {
  const { rows } = await getPool().query<Row>(
    `SELECT ${CHAMPS} FROM coloriages WHERE slug = $1`,
    [slug],
  );
  return rows[0] ? toColoriage(rows[0]) : null;
}

export interface ImageStockee {
  mime: string;
  donnees: Buffer;
  /** Sert d'ETag : régénérer un dessin change sa date, donc son empreinte. */
  genereLe: Date;
}

export async function getImage(slug: string): Promise<ImageStockee | null> {
  const { rows } = await getPool().query<{
    mime: string;
    donnees: Buffer;
    genere_le: Date;
  }>(
    `SELECT c.mime, i.donnees, c.genere_le
       FROM coloriage_images i
       JOIN coloriages c ON c.slug = i.slug
      WHERE i.slug = $1 AND c.statut = 'publie'`,
    [slug],
  );
  const row = rows[0];
  return row ? { mime: row.mime, donnees: row.donnees, genereLe: row.genere_le } : null;
}

/** Comme `getImage`, mais sans exiger la publication : pour la relecture. */
export async function getImageBrouillon(
  slug: string,
): Promise<{ mime: string; donnees: Buffer } | null> {
  const { rows } = await getPool().query<{ mime: string; donnees: Buffer }>(
    `SELECT c.mime, i.donnees
       FROM coloriage_images i
       JOIN coloriages c ON c.slug = i.slug
      WHERE i.slug = $1`,
    [slug],
  );
  return rows[0] ?? null;
}

export interface EnregistrerInput {
  slug: string;
  theme: string;
  largeur: number;
  hauteur: number;
  mime: string;
  donnees: Buffer;
}

/**
 * Range un dessin fraîchement généré, en brouillon.
 *
 * Régénérer écrase le précédent et **repasse en brouillon** : un dessin publié
 * qu'on régénère doit être revalidé, sinon on remplacerait sans le voir une
 * image déjà en ligne.
 */
export async function enregistrer(input: EnregistrerInput): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO coloriages (slug, theme, statut, largeur, hauteur, mime, genere_le, publie_le)
       VALUES ($1, $2, 'brouillon', $3, $4, $5, now(), NULL)
       ON CONFLICT (slug) DO UPDATE
         SET theme = EXCLUDED.theme,
             statut = 'brouillon',
             largeur = EXCLUDED.largeur,
             hauteur = EXCLUDED.hauteur,
             mime = EXCLUDED.mime,
             genere_le = now(),
             publie_le = NULL`,
      [input.slug, input.theme, input.largeur, input.hauteur, input.mime],
    );
    await client.query(
      `INSERT INTO coloriage_images (slug, donnees)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET donnees = EXCLUDED.donnees`,
      [input.slug, input.donnees],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function changerStatut(slug: string, statut: Statut): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `UPDATE coloriages
        SET statut = $2,
            publie_le = CASE WHEN $2 = 'publie' THEN now() ELSE NULL END
      WHERE slug = $1`,
    [slug, statut],
  );
  return (rowCount ?? 0) > 0;
}

export async function supprimer(slug: string): Promise<void> {
  // L'image part avec, par la clé étrangère ON DELETE CASCADE.
  await getPool().query("DELETE FROM coloriages WHERE slug = $1", [slug]);
}
