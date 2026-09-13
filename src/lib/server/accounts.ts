import { getPool } from "./pool";

/**
 * Comptes et solde de crédits, dans Postgres.
 *
 * C'est le seul endroit où vit de l'argent. Deux principes y sont tenus :
 *
 *   - **Chaque opération est atomique en une instruction.** Le débit est un
 *     `UPDATE … WHERE credits >= n RETURNING credits` : pas de lecture suivie
 *     d'une écriture, donc pas de course entre deux instances.
 *   - **Le crédit est idempotent par le schéma.** L'identifiant de session
 *     Stripe est la clé primaire de `purchases` : le second appel — webhook ou
 *     retour de paiement, dans n'importe quel ordre — n'insère rien et ne
 *     crédite rien.
 *
 * Le schéma est dans `migrations/`, appliqué au démarrage par
 * `scripts/migrate.mjs`.
 */

export interface Purchase {
  sessionId: string;
  packId: string;
  credits: number;
  amount: number;
  at: number;
}

export interface Account {
  id: string;
  email?: string;
  name?: string;
  credits: number;
  createdAt: number;
  purchases: Purchase[];
}

export interface Identity {
  id: string;
  email?: string | null;
  name?: string | null;
}

interface AccountRow {
  id: string;
  email: string | null;
  name: string | null;
  credits: number;
  created_at: Date;
}

interface PurchaseRow {
  stripe_session_id: string;
  pack_id: string;
  credits: number;
  amount: number;
  created_at: Date;
}

/**
 * Crée le compte s'il n'existe pas et rafraîchit les informations venues de
 * Google. `COALESCE` évite d'écraser un email connu par un `null`.
 */
const UPSERT = `
  INSERT INTO accounts (id, email, name)
  VALUES ($1, $2, $3)
  ON CONFLICT (id) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, accounts.email),
        name  = COALESCE(EXCLUDED.name,  accounts.name)
  RETURNING id, email, name, credits, created_at
`;

function toAccount(row: AccountRow, purchases: Purchase[] = []): Account {
  return {
    id: row.id,
    email: row.email ?? undefined,
    name: row.name ?? undefined,
    credits: row.credits,
    createdAt: row.created_at.getTime(),
    purchases,
  };
}

export async function getAccount(identity: Identity): Promise<Account> {
  const pool = getPool();
  const account = await pool.query<AccountRow>(UPSERT, [
    identity.id,
    identity.email ?? null,
    identity.name ?? null,
  ]);
  const purchases = await pool.query<PurchaseRow>(
    `SELECT stripe_session_id, pack_id, credits, amount, created_at
       FROM purchases
      WHERE account_id = $1
      ORDER BY created_at DESC
      LIMIT 50`,
    [identity.id],
  );

  return toAccount(
    account.rows[0],
    purchases.rows.map((row) => ({
      sessionId: row.stripe_session_id,
      packId: row.pack_id,
      credits: row.credits,
      amount: row.amount,
      at: row.created_at.getTime(),
    })),
  );
}

export interface GrantInput {
  identity: Identity;
  sessionId: string;
  packId: string;
  credits: number;
  amount: number;
}

export interface GrantResult {
  credits: number;
  /** false si cette session avait déjà été créditée. */
  granted: boolean;
}

export async function grantCredits(input: GrantInput): Promise<GrantResult> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(UPSERT, [
      input.identity.id,
      input.identity.email ?? null,
      input.identity.name ?? null,
    ]);

    // Si la session est déjà enregistrée, rien n'est inséré : c'est là que se
    // joue l'idempotence, sans lecture préalable ni verrou applicatif.
    const inserted = await client.query(
      `INSERT INTO purchases (stripe_session_id, account_id, pack_id, credits, amount)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [input.sessionId, input.identity.id, input.packId, input.credits, input.amount],
    );

    if (inserted.rowCount === 0) {
      const current = await client.query<{ credits: number }>(
        "SELECT credits FROM accounts WHERE id = $1",
        [input.identity.id],
      );
      await client.query("COMMIT");
      return { credits: current.rows[0]?.credits ?? 0, granted: false };
    }

    const updated = await client.query<{ credits: number }>(
      `UPDATE accounts SET credits = credits + $2 WHERE id = $1 RETURNING credits`,
      [input.identity.id, input.credits],
    );
    await client.query("COMMIT");
    return { credits: updated.rows[0].credits, granted: true };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export type Deblocage =
  | { etat: "paye"; credits: number }
  | { etat: "deja-payee" }
  | { etat: "disparue" }
  | { etat: "sans-credit"; credits: number };

/**
 * Marque un coloriage payé **et** débite le crédit, dans la même transaction.
 *
 * Les deux écritures touchent deux tables, et ce module est le seul endroit où
 * vit de l'argent : c'est donc ici que la transaction doit se tenir, même si la
 * première ligne parle d'œuvres.
 *
 * Pourquoi une transaction, et pas deux requêtes à la suite : le marquage seul
 * était visible des autres requêtes dès son COMMIT, avant que le crédit ne soit
 * acquis. Une seconde requête arrivant dans cette fenêtre voyait « déjà payée »
 * et livrait l'original sans rien débiter — il suffisait d'un compte à zéro
 * crédit et de deux appels simultanés pour se servir. Ici, le verrou posé sur la
 * ligne de `oeuvres` tient jusqu'au COMMIT : la requête jumelle attend, puis lit
 * un état définitif, payé ou pas du tout.
 *
 * Trois issues, et trois seulement : payé (crédit débité), déjà payée (on
 * resservira sans débiter — rechargement, second téléchargement), ou pas de
 * crédit (rien n'a bougé, le ROLLBACK a défait le marquage).
 */
export async function debiterPourDeblocage(
  identity: Identity,
  oeuvreId: string,
): Promise<Deblocage> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reclamee = await client.query(
      `UPDATE oeuvres SET debloquee_le = now()
        WHERE id = $1 AND debloquee_le IS NULL
        RETURNING id`,
      [oeuvreId],
    );
    if (reclamee.rowCount === 0) {
      /**
       * Zéro ligne veut dire deux choses très différentes : l'œuvre était déjà
       * payée, ou elle n'existe plus. La purge des essais expirés peut passer
       * entre la lecture du fichier par la route et cette transaction —
       * confondre les deux livrerait gratuitement un original qu'on vient
       * d'effacer.
       */
      const existe = await client.query(
        "SELECT 1 FROM oeuvres WHERE id = $1",
        [oeuvreId],
      );
      await client.query("COMMIT");
      return existe.rowCount === 0 ? { etat: "disparue" } : { etat: "deja-payee" };
    }

    const debit = await client.query<{ credits: number }>(
      `UPDATE accounts SET credits = credits - 1
        WHERE id = $1 AND credits >= 1
        RETURNING credits`,
      [identity.id],
    );
    if (debit.rowCount === 0) {
      // Le marquage part avec le ROLLBACK : personne ne l'aura jamais vu.
      await client.query("ROLLBACK");
      // Sur `client`, pas sur `pool` : la connexion est redevenue utilisable
      // après le ROLLBACK, et en demander une seconde sans avoir rendu la
      // première épuiserait le pool — dix comptes sans crédit suffiraient à
      // figer toutes les requêtes du serveur, définitivement.
      const current = await client.query<{ credits: number }>(
        "SELECT credits FROM accounts WHERE id = $1",
        [identity.id],
      );
      return { etat: "sans-credit", credits: current.rows[0]?.credits ?? 0 };
    }

    await client.query("COMMIT");
    return { etat: "paye", credits: debit.rows[0].credits };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export interface ConsumeResult {
  ok: boolean;
  credits: number;
}

export async function consumeCredit(
  identity: Identity,
  amount = 1,
): Promise<ConsumeResult> {
  const pool = getPool();
  // Une seule instruction : la condition sur le solde et le débit sont
  // évalués sous le même verrou de ligne. Aucune course possible, même si
  // dix requêtes arrivent en même temps sur des instances différentes.
  const updated = await pool.query<{ credits: number }>(
    `UPDATE accounts
        SET credits = credits - $2
      WHERE id = $1 AND credits >= $2
      RETURNING credits`,
    [identity.id, amount],
  );

  if (updated.rowCount === 1) {
    return { ok: true, credits: updated.rows[0].credits };
  }

  // Zéro ligne : soit le solde est insuffisant, soit le compte n'existe pas.
  const current = await pool.query<{ credits: number }>(
    "SELECT credits FROM accounts WHERE id = $1",
    [identity.id],
  );
  return { ok: false, credits: current.rows[0]?.credits ?? 0 };
}

/** Rend un crédit si l'étape suivante a échoué côté client. */
export async function refundCredit(
  identity: Identity,
  amount = 1,
): Promise<number> {
  const pool = getPool();
  const updated = await pool.query<{ credits: number }>(
    `UPDATE accounts SET credits = credits + $2 WHERE id = $1 RETURNING credits`,
    [identity.id, amount],
  );
  return updated.rows[0]?.credits ?? 0;
}
