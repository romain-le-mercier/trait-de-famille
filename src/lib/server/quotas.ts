import { getPool } from "./pool";

/**
 * Quota d'aperçus gratuits — voir `migrations/003_quota_apercus.sql` pour le
 * pourquoi.
 *
 * Deux plafonds, et la connexion Google fait office de second palier : elle
 * coûte assez d'efforts pour qu'on puisse être généreux derrière, et un client
 * qui a payé ne doit jamais se heurter au mur des visiteurs anonymes.
 */
export const PLAFOND_ANONYME = 3;
export const PLAFOND_CONNECTE = 30;

export interface Decompte {
  autorise: boolean;
  restant: number;
  plafond: number;
}

/**
 * Identifie le visiteur pour le décompte, ou `null` si c'est impossible.
 *
 * `null` veut dire « aucun mandataire devant nous » : en production, Cloudflare
 * comme le proxy de l'hébergeur posent toujours l'un de ces en-têtes, donc ce
 * cas ne se produit qu'en développement local. On laisse alors passer plutôt
 * que de mettre tous les visiteurs dans un même seau — mais l'état est visible
 * depuis `GET /api/generate`, pour qu'un jour sans garde se constate au lieu
 * de se supposer.
 */
export function cleVisiteur(request: Request, compteId?: string | null): string | null {
  if (compteId) return `compte:${compteId}`;

  const entetes = request.headers;
  const adresse =
    // Cloudflare réécrit celui-ci à chaque passage : infalsifiable de l'extérieur.
    entetes.get("cf-connecting-ip") ??
    entetes.get("x-forwarded-for")?.split(",")[0] ??
    entetes.get("x-real-ip");

  const propre = adresse?.trim();
  return propre ? `ip:${propre}` : null;
}

export function plafondPour(connecte: boolean): number {
  return connecte ? PLAFOND_CONNECTE : PLAFOND_ANONYME;
}

/**
 * Décompte un aperçu, si le plafond du jour n'est pas atteint.
 *
 * Le `WHERE` de la clause `ON CONFLICT` fait tout le travail : quand le
 * plafond est déjà atteint, aucune ligne n'est renvoyée et le compteur n'est
 * pas gonflé. Tout tient dans un seul aller-retour, donc deux requêtes
 * simultanées ne peuvent pas passer ensemble.
 */
export async function consommer(cle: string, plafond: number): Promise<Decompte> {
  if (plafond <= 0) return { autorise: false, restant: 0, plafond };

  const { rows } = await getPool().query<{ utilisees: number }>(
    `INSERT INTO quotas_apercu (cle, jour, utilisees)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (cle, jour) DO UPDATE
       SET utilisees = quotas_apercu.utilisees + 1
       WHERE quotas_apercu.utilisees < $2
     RETURNING utilisees`,
    [cle, plafond],
  );

  if (rows.length === 0) return { autorise: false, restant: 0, plafond };
  return {
    autorise: true,
    restant: Math.max(0, plafond - rows[0].utilisees),
    plafond,
  };
}

/**
 * Rend le décompte quand le modèle a échoué.
 *
 * Même principe que le crédit rendu dans `unlockArtwork` : personne ne perd
 * son tour pour une panne qui n'est pas la sienne.
 */
export async function rendre(cle: string): Promise<void> {
  await getPool().query(
    `UPDATE quotas_apercu SET utilisees = utilisees - 1
     WHERE cle = $1 AND jour = CURRENT_DATE AND utilisees > 0`,
    [cle],
  );
}

/** Ce qu'il reste au visiteur aujourd'hui, sans rien décompter. */
export async function restant(cle: string, plafond: number): Promise<number> {
  const { rows } = await getPool().query<{ utilisees: number }>(
    `SELECT utilisees FROM quotas_apercu WHERE cle = $1 AND jour = CURRENT_DATE`,
    [cle],
  );
  return Math.max(0, plafond - (rows[0]?.utilisees ?? 0));
}

/**
 * Purge opportuniste des jours passés : une fois sur cent, plutôt qu'un
 * planificateur à installer et à surveiller pour quelques kilo-octets.
 */
export async function purgerParfois(): Promise<void> {
  if (Math.random() > 0.01) return;
  try {
    await getPool().query(
      `DELETE FROM quotas_apercu WHERE jour < CURRENT_DATE - INTERVAL '7 days'`,
    );
  } catch {
    // Sans conséquence : la table sera purgée au prochain passage.
  }
}
