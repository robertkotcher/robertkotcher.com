import pg from "pg";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const parsedUrl = new URL(databaseUrl);
const useSsl = !["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname) && parsedUrl.searchParams.get("sslmode") !== "disable";
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
const migrationPath = join(root, "db", "migrations", "0001_inbox_threads.sql");
const migration = await readFile(migrationPath, "utf8");
const statements = migration
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await pool.query(statement);
}

await pool.end();
console.log(`Applied ${statements.length} migration statements.`);
