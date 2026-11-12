import pg from "pg";

const { Pool } = pg;
let pool: pg.Pool | undefined;

export function promptDb() {
  const connectionString = process.env.NYC_BUDGET_DATABASE_URL;
  if (!connectionString) throw new Error("The local prompt database is not configured.");
  return pool ??= new Pool({ connectionString, max: 4 });
}
