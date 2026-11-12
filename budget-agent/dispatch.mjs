import pg from "pg";
import { CronExpressionParser } from "cron-parser";
import { Client } from "eve/client";

const origin = process.env.NYC_BUDGET_EVE_URL ?? "http://127.0.0.1:2034";
const eveClient = new Client({ baseUrl: origin });
let pool;

function database() {
  if (!process.env.NYC_BUDGET_DATABASE_URL) throw new Error("Set NYC_BUDGET_DATABASE_URL.");
  return pool ??= new pg.Pool({ connectionString: process.env.NYC_BUDGET_DATABASE_URL, max: 6 });
}

function eve(path, body, signal = AbortSignal.timeout(15_000)) {
  return fetch(`${origin}/eve/v1${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
}

async function claim() {
  const db = await database().connect();
  try {
    await db.query("BEGIN");
    const { rows: [job] } = await db.query(`
      SELECT * FROM budget_prompt_cells c
      WHERE c.next_run_at <= now() AND c.formula IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM budget_prompt_runs r
          WHERE r.sheet = c.sheet AND r.cell = c.cell AND r.version = c.version AND r.status = 'running'
        )
      ORDER BY c.next_run_at LIMIT 1 FOR UPDATE SKIP LOCKED`);
    if (!job) {
      await db.query("COMMIT");
      return null;
    }
    const { rows: [run] } = await db.query(`
      INSERT INTO budget_prompt_runs (sheet, cell, version, due_at, status, lease_until)
      VALUES ($1, $2, $3, $4, 'running', now() + interval '6 minutes') RETURNING id`,
      [job.sheet, job.cell, job.version, job.next_run_at]);
    await db.query(`UPDATE budget_prompt_cells SET status = 'running', next_run_at = NULL, error = NULL
      WHERE sheet = $1 AND cell = $2`, [job.sheet, job.cell]);
    await db.query("COMMIT");
    return { ...job, id: run.id };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}

async function finish(run, result, error) {
  const next = run.schedule
    ? CronExpressionParser.parse(run.schedule.cron, { tz: run.schedule.timezone }).next().toDate()
    : null;
  await database().query(`
    WITH settled AS (
      UPDATE budget_prompt_runs SET status = $1, lease_until = NULL
      WHERE id = $2 AND status = 'running' RETURNING id
    )
    UPDATE budget_prompt_cells
    SET status = $1, result = COALESCE($3, result), error = $4, next_run_at = $5
    WHERE sheet = $6 AND cell = $7 AND version = $8 AND EXISTS (SELECT 1 FROM settled)`,
    [error ? "failed" : "complete", run.id, result, error, next, run.sheet, run.cell, run.version]);
}

async function cancelRequested() {
  const { rows } = await database().query(`
    SELECT id, eve_session_id, eve_turn_id FROM budget_prompt_runs
    WHERE status = 'cancel_requested' AND eve_session_id IS NOT NULL`);
  for (const row of rows) {
    try {
      const response = await eve(`/session/${encodeURIComponent(row.eve_session_id)}/cancel`,
        row.eve_turn_id ? { turnId: row.eve_turn_id } : {});
      if (!response.ok && response.status !== 404) continue;
      await database().query("UPDATE budget_prompt_runs SET status = 'cancelled' WHERE id = $1 AND status = 'cancel_requested'", [row.id]);
    } catch {
      // Keep the request durable so the next dispatch can retry.
    }
  }
}

async function readReply(run, sessionId, signal) {
  const session = eveClient.sessions.attach(sessionId);
  const parts = new Map();

  for await (const { type, data, scope } of session.stream({ signal })) {
    if (type === "turn.started") {
      await database().query("UPDATE budget_prompt_runs SET eve_turn_id = $1 WHERE id = $2",
        [data.turnId ?? scope.turnId, run.id]);
    }
    if (type === "content.completed" && data.kind === "text" && typeof data.value === "string") {
      parts.set(data.partId, data.value);
    }
    if (type === "turn.paused") throw new Error("Eve paused. Check the research agent’s model connection.");
    if (type === "turn.settled") {
      if (data.outcome !== "completed") throw new Error("The Eve turn did not complete. Check the agent logs.");
      const markdown = data.reply.map((id) => parts.get(id) ?? "").join("\n\n").trim();
      if (!markdown) throw new Error("The research agent returned an empty result.");
      return markdown.slice(0, 25_000);
    }
  }
  signal.throwIfAborted();
  throw new Error("The Eve session ended before a result arrived.");
}

async function research(run) {
  const abort = new AbortController();
  let sessionId;
  const timer = setInterval(async () => {
    try {
      const { rows: [current] } = await database().query("SELECT status FROM budget_prompt_runs WHERE id = $1", [run.id]);
      if (current?.status !== "running") {
        await cancelRequested();
        abort.abort();
      }
    } catch {
      // The version check still protects the result if polling is interrupted.
    }
  }, 1_000);

  try {
    const message = JSON.stringify({
      location: "Millburn, NJ", schoolDistrict: "Millburn Township Public Schools",
      researchPrompt: run.research_prompt,
    });
    const response = await eve("/session", { message, operationId: `budget-run-${run.id}` });
    if (!response.ok) throw new Error("Could not start Eve research. Check the local agent connection.");
    ({ sessionId } = await response.json());
    if (typeof sessionId !== "string") throw new Error("Eve did not return a session ID.");
    await database().query("UPDATE budget_prompt_runs SET eve_session_id = $1 WHERE id = $2", [sessionId, run.id]);
    await cancelRequested();
    const markdown = await readReply(run, sessionId, AbortSignal.any([abort.signal, AbortSignal.timeout(300_000)]));
    await finish(run, markdown, null);
  } catch (error) {
    if (sessionId) await eve(`/session/${encodeURIComponent(sessionId)}/cancel`, {}).catch(() => {});
    await finish(run, null, error instanceof Error && error.name !== "TimeoutError"
      ? error.message : "Research timed out. Check the local agent and try again.");
  } finally {
    clearInterval(timer);
  }
}

export async function dispatch() {
  await cancelRequested();
  const { rows } = await database().query(`
    SELECT r.*, c.schedule FROM budget_prompt_runs r JOIN budget_prompt_cells c
      ON c.sheet = r.sheet AND c.cell = r.cell AND c.version = r.version
    WHERE r.status = 'running' AND r.lease_until < now()`);
  for (const run of rows) await finish(run, null, "The worker stopped before the result was saved.");
  for (let count = 0; count < 4; count++) {
    const run = await claim();
    if (!run) break;
    await research(run);
  }
}
