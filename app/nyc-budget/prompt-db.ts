import pg from "pg";

const { Pool } = pg;
let pool: pg.Pool | undefined;

export function promptDb() {
  const connectionString = process.env.NYC_BUDGET_DATABASE_URL ??
    (process.env.VERCEL_ENV === "production" ? process.env.DATABASE_URL : undefined);
  if (!connectionString) throw new Error("The local prompt database is not configured.");
  return pool ??= new Pool({ connectionString, max: 4 });
}
