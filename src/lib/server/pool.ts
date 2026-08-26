import { Pool } from "pg";

/**
 * Le pool Postgres, partagé par tout le serveur.
 *
 * Il vit ici et nulle part ailleurs : deux modules qui ouvriraient chacun le
 * leur doubleraient le nombre de connexions, pour une base qui en compte peu.
 */

const connectionString = process.env.DATABASE_URL;

/**
 * En développement, Next recharge les modules à chaque modification : sans ce
 * cache, chaque rechargement ouvrirait un pool de plus jusqu'à saturer les
 * connexions de la base.
 */
const globalForPool = globalThis as unknown as { traitDeFamillePool?: Pool };

export function getPool(): Pool {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL est absente : impossible de lire ou d'écrire en base.",
    );
  }
  globalForPool.traitDeFamillePool ??= new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    ssl: /[?&]sslmode=(require|prefer)/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  return globalForPool.traitDeFamillePool;
}
