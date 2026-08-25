import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * Comptes et solde de crédits, côté serveur.
 *
 * Volontairement minimal : un fichier JSON, des écritures sérialisées et
 * atomiques. C'est suffisant pour un mono-serveur et ça évite d'imposer une
 * base de données avant qu'il y en ait besoin.
 *
 * ⚠️ À remplacer par Postgres / Redis avant toute mise en production
 * sérieuse : ce store ne survit pas à un déploiement serverless (système de
 * fichiers éphémère) et ne supporte pas plusieurs instances. Toute la logique
 * métier passe par les fonctions ci-dessous — c'est le seul fichier à
 * réécrire le jour où on change de socle.
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

interface Database {
  accounts: Record<string, Account>;
  /** Sessions Stripe déjà créditées : garantit l'idempotence entre le webhook
   *  et la vérification au retour de paiement, qui peuvent arriver dans
   *  n'importe quel ordre. */
  processedSessions: string[];
}

const DATA_FILE = join(process.cwd(), ".data", "accounts.json");
const EMPTY: Database = { accounts: {}, processedSessions: [] };

/** Toutes les écritures passent par cette chaîne : pas d'entrelacement. */
let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<Database> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      accounts: parsed.accounts ?? {},
      processedSessions: parsed.processedSessions ?? [],
    };
  } catch {
    return { ...EMPTY };
  }
}

async function write(database: Database) {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const temporary = `${DATA_FILE}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(database, null, 2), "utf8");
  await rename(temporary, DATA_FILE); // atomique : jamais de fichier tronqué
}

function transaction<T>(mutate: (database: Database) => T | Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    const database = await read();
    const result = await mutate(database);
    await write(database);
    return result;
  });
  // La file continue même si une transaction échoue.
  queue = next.catch(() => undefined);
  return next;
}

function ensure(database: Database, id: string): Account {
  const existing = database.accounts[id];
  if (existing) return existing;
  const account: Account = {
    id,
    credits: 0,
    createdAt: Date.now(),
    purchases: [],
  };
  database.accounts[id] = account;
  return account;
}

export interface Identity {
  id: string;
  email?: string | null;
  name?: string | null;
}

export async function getAccount(identity: Identity): Promise<Account> {
  return transaction((database) => {
    const account = ensure(database, identity.id);
    if (identity.email) account.email = identity.email;
    if (identity.name) account.name = identity.name;
    return { ...account };
  });
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
  return transaction((database) => {
    const account = ensure(database, input.identity.id);
    if (input.identity.email) account.email = input.identity.email;
    if (input.identity.name) account.name = input.identity.name;

    if (database.processedSessions.includes(input.sessionId)) {
      return { credits: account.credits, granted: false };
    }

    account.credits += input.credits;
    account.purchases.unshift({
      sessionId: input.sessionId,
      packId: input.packId,
      credits: input.credits,
      amount: input.amount,
      at: Date.now(),
    });
    database.processedSessions.push(input.sessionId);
    return { credits: account.credits, granted: true };
  });
}

export interface ConsumeResult {
  ok: boolean;
  credits: number;
}

export async function consumeCredit(
  identity: Identity,
  amount = 1,
): Promise<ConsumeResult> {
  return transaction((database) => {
    const account = ensure(database, identity.id);
    if (account.credits < amount) {
      return { ok: false, credits: account.credits };
    }
    account.credits -= amount;
    return { ok: true, credits: account.credits };
  });
}

/** Rend un crédit si l'étape suivante a échoué côté client. */
export async function refundCredit(
  identity: Identity,
  amount = 1,
): Promise<number> {
  return transaction((database) => {
    const account = ensure(database, identity.id);
    account.credits += amount;
    return account.credits;
  });
}
