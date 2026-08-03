import pg from "pg";
import { readdir, readFile } from "node:fs/promises";
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
const migrationsDir = join(root, "db", "migrations");
const migrationFiles = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

let statementCount = 0;
for (const file of migrationFiles) {
  const migration = await readFile(join(migrationsDir, file), "utf8");
  const statements = migration
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
    statementCount += 1;
  }
}

await pool.end();
console.log(`Applied ${statementCount} migration statements from ${migrationFiles.length} migration files.`);
