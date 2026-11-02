import { getPool } from "./pool";

/**
 * Les chiffres du tableau de bord de l'administration (T-011).
 *
 * Lecture seule, et réservée à l'admin : ce module renvoie des e-mails. Il
 * n'est appelé que par la page `/admin/tableau-de-bord`, après `getAdmin()`,
 * et rien de ce qu'il renvoie ne doit être journalisé.
 *
 * Une requête par table, avec des `FILTER` par période : chaque table n'est
 * parcourue qu'une fois, quel que soit le nombre de périodes affichées.
 */

export type Periode = "j1" | "j7" | "j28" | "total";

export const PERIODES: { cle: Periode; libelle: string }[] = [
  { cle: "j1", libelle: "24 h" },
  { cle: "j7", libelle: "7 j" },
  { cle: "j28", libelle: "28 j" },
  { cle: "total", libelle: "Depuis le début" },
];

export type ParPeriode = Record<Periode, number>;

export interface Chiffres {
  comptes: ParPeriode;
  oeuvres: ParPeriode;
  oeuvresAnonymes: ParPeriode;
  oeuvresCompte: ParPeriode;
  oeuvresDebloquees: ParPeriode;
  achats: ParPeriode;
  /** En centimes, comme `purchases.amount`. */
  chiffreAffaires: ParPeriode;
  /**
   * Les quotas ne gardent que 7 jours (purge dans `quotas.ts`) et comptent
   * par jour calendaire : « 24 h » vaut ici « aujourd'hui », et 28 j ou le
   * total ne remontent pas au-delà de la purge.
   */
  apercus: ParPeriode;
}

export interface Entonnoir {
  oeuvres: number;
  proprietaires: number;
  comptes: number;
  comptesAcheteurs: number;
}

export interface DernierCompte {
  id: string;
  email: string | null;
  creeLe: Date;
  credits: number;
  oeuvres: number;
  achats: number;
  montant: number;
}

export interface DerniereOeuvre {
  id: string;
  creeLe: Date;
  /** Jamais le jeton anonyme complet ni le `sub` Google brut. */
  proprietaire: string;
  anonyme: boolean;
  payee: boolean;
}

/**
 * Les quatre colonnes de période, sur une colonne de date donnée. `FILTER`
 * s'accroche à l'agrégat, le `coalesce` (pour une somme vide) l'enrobe.
 */
function filtres(colonne: string, agregat = "count(*)"): string {
  const f = (condition: string | null) => {
    const expr = condition ? `${agregat} FILTER (WHERE ${condition})` : agregat;
    return `coalesce(${expr}, 0)`;
  };
  return `
    ${f(`${colonne} >= now() - interval '24 hours'`)} AS j1,
    ${f(`${colonne} >= now() - interval '7 days'`)}   AS j7,
    ${f(`${colonne} >= now() - interval '28 days'`)}  AS j28,
    ${f(null)}                                         AS total`;
}

type Ligne = Record<Periode, string | number | null>;

const lire = (ligne: Ligne | undefined): ParPeriode => ({
  j1: Number(ligne?.j1 ?? 0),
  j7: Number(ligne?.j7 ?? 0),
  j28: Number(ligne?.j28 ?? 0),
  total: Number(ligne?.total ?? 0),
});

export async function chiffres(): Promise<Chiffres> {
  const pool = getPool();

  const [comptes, oeuvres, anonymes, compte, debloquees, achats, ca, apercus] =
    await Promise.all([
      pool.query<Ligne>(`SELECT ${filtres("created_at")} FROM accounts`),
      pool.query<Ligne>(`SELECT ${filtres("creee_le")} FROM oeuvres`),
      pool.query<Ligne>(
        `SELECT ${filtres("creee_le")} FROM oeuvres WHERE proprietaire LIKE 'anon:%'`,
      ),
      pool.query<Ligne>(
        `SELECT ${filtres("creee_le")} FROM oeuvres WHERE proprietaire LIKE 'compte:%'`,
      ),
      // Payée = débloquée ; la période suit la date du déblocage, pas celle de
      // la génération : c'est le moment où l'argent est entré.
      pool.query<Ligne>(
        `SELECT ${filtres("debloquee_le")} FROM oeuvres WHERE debloquee_le IS NOT NULL`,
      ),
      pool.query<Ligne>(`SELECT ${filtres("created_at")} FROM purchases`),
      pool.query<Ligne>(
        `SELECT ${filtres("created_at", "sum(amount)")} FROM purchases`,
      ),
      pool.query<Ligne>(
        `SELECT
           coalesce(sum(utilisees) FILTER (WHERE jour >= CURRENT_DATE), 0)                       AS j1,
           coalesce(sum(utilisees) FILTER (WHERE jour >= CURRENT_DATE - interval '6 days'), 0)  AS j7,
           coalesce(sum(utilisees) FILTER (WHERE jour >= CURRENT_DATE - interval '27 days'), 0) AS j28,
           coalesce(sum(utilisees), 0)                                                          AS total
         FROM quotas_apercu`,
      ),
    ]);

  return {
    comptes: lire(comptes.rows[0]),
    oeuvres: lire(oeuvres.rows[0]),
    oeuvresAnonymes: lire(anonymes.rows[0]),
    oeuvresCompte: lire(compte.rows[0]),
    oeuvresDebloquees: lire(debloquees.rows[0]),
    achats: lire(achats.rows[0]),
    chiffreAffaires: lire(ca.rows[0]),
    apercus: lire(apercus.rows[0]),
  };
}

/**
 * L'entonnoir des 28 derniers jours, à partir des œuvres générées.
 *
 * Le propriétaire est celui d'aujourd'hui : un essai anonyme réclamé à la
 * connexion compte du côté « compte », ce qui est bien la marche franchie.
 */
export async function entonnoir(): Promise<Entonnoir> {
  const { rows } = await getPool().query<{
    oeuvres: string;
    proprietaires: string;
    comptes: string;
    acheteurs: string;
  }>(
    `WITH recentes AS (
       SELECT proprietaire FROM oeuvres
        WHERE creee_le >= now() - interval '28 days'
     ),
     comptes AS (
       SELECT DISTINCT substr(proprietaire, 8) AS id
         FROM recentes WHERE proprietaire LIKE 'compte:%'
     )
     SELECT
       (SELECT count(*) FROM recentes)                             AS oeuvres,
       (SELECT count(DISTINCT proprietaire) FROM recentes)         AS proprietaires,
       (SELECT count(*) FROM comptes)                              AS comptes,
       (SELECT count(*) FROM comptes c
         WHERE EXISTS (SELECT 1 FROM purchases p
                        WHERE p.account_id = c.id
                          AND p.created_at >= now() - interval '28 days')) AS acheteurs`,
  );
  const l = rows[0];
  return {
    oeuvres: Number(l?.oeuvres ?? 0),
    proprietaires: Number(l?.proprietaires ?? 0),
    comptes: Number(l?.comptes ?? 0),
    comptesAcheteurs: Number(l?.acheteurs ?? 0),
  };
}

export async function derniersComptes(limite = 50): Promise<DernierCompte[]> {
  const { rows } = await getPool().query<{
    id: string;
    email: string | null;
    created_at: Date;
    credits: number;
    oeuvres: string;
    achats: string;
    montant: string;
  }>(
    `SELECT a.id, a.email, a.created_at, a.credits,
            o.nombre AS oeuvres, p.nombre AS achats, p.montant
       FROM (SELECT id, email, created_at, credits FROM accounts
              ORDER BY created_at DESC LIMIT $1) a
       CROSS JOIN LATERAL (
         SELECT count(*) AS nombre FROM oeuvres
          WHERE proprietaire = 'compte:' || a.id
       ) o
       CROSS JOIN LATERAL (
         SELECT count(*) AS nombre, coalesce(sum(amount), 0) AS montant
           FROM purchases WHERE account_id = a.id
       ) p
      ORDER BY a.created_at DESC`,
    [limite],
  );
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    creeLe: r.created_at,
    credits: r.credits,
    oeuvres: Number(r.oeuvres),
    achats: Number(r.achats),
    montant: Number(r.montant),
  }));
}

/** Les quatre premiers caractères suffisent à distinguer deux visiteurs. */
const abreger = (valeur: string) => `${valeur.slice(0, 4)}…`;

export async function dernieresOeuvres(limite = 50): Promise<DerniereOeuvre[]> {
  const { rows } = await getPool().query<{
    id: string;
    creee_le: Date;
    proprietaire: string;
    debloquee_le: Date | null;
    email: string | null;
  }>(
    `SELECT o.id, o.creee_le, o.proprietaire, o.debloquee_le, a.email
       FROM (SELECT id, creee_le, proprietaire, debloquee_le FROM oeuvres
              ORDER BY creee_le DESC LIMIT $1) o
       LEFT JOIN accounts a ON o.proprietaire = 'compte:' || a.id
      ORDER BY o.creee_le DESC`,
    [limite],
  );
  return rows.map((r) => {
    const anonyme = r.proprietaire.startsWith("anon:");
    const [, reste = ""] = r.proprietaire.split(/:(.*)/s);
    return {
      id: r.id,
      creeLe: r.creee_le,
      proprietaire: anonyme
        ? `anonyme ${abreger(reste)}`
        : (r.email ?? `compte ${abreger(reste)}`),
      anonyme,
      payee: r.debloquee_le !== null,
    };
  });
}
