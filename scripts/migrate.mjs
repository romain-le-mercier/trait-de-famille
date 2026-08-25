#!/usr/bin/env node
/**
 * Applique les migrations SQL au démarrage du conteneur.
 *
 * La base n'est joignable que depuis le réseau interne de l'hébergeur : les
 * migrations ne peuvent donc pas être lancées depuis un poste de dev. Elles
 * tournent ici, juste avant le serveur, dans `npm start`.
 *
 * Trois garanties :
 *   - un verrou consultatif Postgres, pour que deux instances qui démarrent
 *     en même temps n'appliquent pas la même migration deux fois ;
 *   - chaque fichier dans sa propre transaction, et son nom enregistré dans
 *     la même transaction : soit tout passe, soit rien ;
 *   - une sortie en erreur si quoi que ce soit échoue, pour que le
 *     déploiement s'arrête au lieu de démarrer sur un schéma incomplet.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "migrations");

/**
 * Ce script tourne avant Next, qui est le seul à lire les fichiers `.env`.
 * En production les variables sont injectées dans l'environnement du
 * conteneur et rien de tout ceci ne sert ; en local, il faut les charger.
 *
 * Même ordre de priorité que Next : l'environnement l'emporte sur
 * `.env.local`, qui l'emporte sur `.env`.
 */
async function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    let contents;
    try {
      contents = await readFile(join(ROOT, name), "utf8");
    } catch {
      continue;
    }
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 1) continue;
      const key = trimmed.slice(0, separator).trim();
      if (process.env[key] !== undefined) continue;
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

await loadEnvFiles();

/** Identifiant arbitraire mais stable du verrou de migration. */
const LOCK_ID = 4_073_219_001;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "[migrate] DATABASE_URL est absente. Le serveur ne peut pas démarrer sans base.",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  // Les hébergeurs qui terminent TLS eux-mêmes présentent souvent un
  // certificat auto-signé ; sur un réseau interne, la vérification stricte
  // ferait échouer la connexion sans rien apporter.
  ssl: /[?&]sslmode=(require|prefer)/.test(connectionString)
    ? { rejectUnauthorized: false }
    : undefined,
});

let locked = false;

try {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
  locked = true;

  const { rows } = await client.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((row) => row.name));

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const name of files) {
    if (applied.has(name)) continue;
    const sql = await readFile(join(MIGRATIONS_DIR, name), "utf8");
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw new Error(`migration ${name} : ${error.message}`, { cause: error });
    }
    console.log(`[migrate] ${name} appliquée`);
    count += 1;
  }

  console.log(
    count === 0
      ? `[migrate] schéma à jour (${files.length} migration(s) déjà appliquée(s))`
      : `[migrate] ${count} migration(s) appliquée(s)`,
  );
} catch (error) {
  console.error("[migrate] échec :", error.message);
  process.exitCode = 1;
} finally {
  if (locked) {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => undefined);
  }
  await client.end().catch(() => undefined);
}
