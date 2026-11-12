import { getVercelOidcToken } from "@vercel/oidc";
import { CronExpressionParser } from "cron-parser";
import { promptDb } from "./prompt-db";

type Run = {
  id: string;
  sheet: string;
  cell: string;
  version: number;
  research_prompt: string;
  schedule: { cron: string; timezone: string } | null;
};

async function claim() {
  const { rows: [run] } = await promptDb().query<Run>(`
    WITH due AS (
      SELECT * FROM budget_prompt_cells
      WHERE next_run_at <= now() AND formula IS NOT NULL
      ORDER BY next_run_at LIMIT 1 FOR UPDATE SKIP LOCKED
    ), claimed AS (
      INSERT INTO budget_prompt_runs (sheet, cell, version, due_at, status, lease_until)
      SELECT sheet, cell, version, next_run_at, 'running', now() + interval '3 minutes' FROM due
      RETURNING id, sheet, cell
    )
    UPDATE budget_prompt_cells c
    SET status = 'running', next_run_at = NULL, error = NULL
    FROM claimed r WHERE c.sheet = r.sheet AND c.cell = r.cell
    RETURNING c.*, r.id
  `);
  return run;
}

async function finish(run: Run, result: string | null, error: string | null) {
  const next = run.schedule
    ? CronExpressionParser.parse(run.schedule.cron, { tz: run.schedule.timezone }).next().toDate()
    : null;
  await promptDb().query(`
    WITH settled AS (
      UPDATE budget_prompt_runs
      SET status = CASE WHEN status = 'cancel_requested' THEN 'cancelled' ELSE $1 END,
          lease_until = NULL
      WHERE id = $2 AND status IN ('running', 'cancel_requested')
      RETURNING status
    )
    UPDATE budget_prompt_cells
    SET status = $1, result = COALESCE($3, result), error = $4, next_run_at = $5
    WHERE sheet = $6 AND cell = $7 AND version = $8
      AND EXISTS (SELECT 1 FROM settled WHERE status <> 'cancelled')
  `, [error ? "failed" : "complete", run.id, result, error, next, run.sheet, run.cell, run.version]);
}

async function research(prompt: string) {
  const token = process.env.AI_GATEWAY_API_KEY ?? await getVercelOidcToken();
  const response = await fetch("https://ai-gateway.vercel.sh/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-5-mini",
      instructions: "Research the user's request for Millburn, NJ, in Millburn Township Public Schools. Verify findings with web search and return concise Markdown with source links.",
      input: prompt,
      tools: [{ type: "web_search" }],
      tool_choice: "required",
      reasoning: { effort: "low" },
      max_output_tokens: 5000,
    }),
    signal: AbortSignal.timeout(75_000),
  });
  if (!response.ok) throw new Error(`AI Gateway returned HTTP ${response.status}.`);
  const data = await response.json();
  if (data.status !== "completed") throw new Error("The research response did not complete.");
  const output = data.output as { type: string; content?: { type: string; text?: string }[] }[];
  const markdown = output.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "").join("\n\n").trim();
  if (!markdown) throw new Error("The research response was empty.");
  return markdown.slice(0, 25_000);
}

export async function dispatchProductionPrompt() {
  const { rows: expired } = await promptDb().query<Run>(`
    SELECT r.*, c.schedule FROM budget_prompt_runs r
    LEFT JOIN budget_prompt_cells c ON c.sheet = r.sheet AND c.cell = r.cell AND c.version = r.version
    WHERE r.status IN ('running', 'cancel_requested') AND r.lease_until < now()
  `);
  for (const run of expired) await finish(run, null, "The worker stopped before the result was saved.");

  const run = await claim();
  if (!run) return "idle";
  let result: string;
  try {
    result = await research(run.research_prompt);
  } catch (error) {
    console.error("Budget prompt failed:", error instanceof Error ? error.message : "Unknown error");
    await finish(run, null, "Research failed. Try running the prompt again.");
    return "failed";
  }
  await finish(run, result, null);
  return "complete";
}
