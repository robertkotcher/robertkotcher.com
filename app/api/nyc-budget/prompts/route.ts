import { after, NextResponse } from "next/server";
import { promptDb } from "../../../nyc-budget/prompt-db";
import { promptText } from "../../../nyc-budget/prompt-formula";
import { buildPromptSchedule } from "../../../nyc-budget/prompt-schedule";

import { isColumnLayoutKey, readColumnShares } from "../../../nyc-budget/column-widths";

import { budgetAuthChallenge, budgetAuthorized } from "../../../nyc-budget/budget-auth";
import { dispatchProductionPrompt } from "../../../nyc-budget/production-prompts";

export const maxDuration = 120;
export const runtime = "nodejs";

function deny(request: Request, write = false) {
  const host = request.headers.get("host") ?? "";
  const production = process.env.VERCEL_ENV === "production";
  if (production) {
    if (!budgetAuthorized(request.headers)) return budgetAuthChallenge();
  } else if (process.env.NODE_ENV !== "development" || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return new Response(null, { status: 404 });
  }
  if (write && request.headers.get("origin") !== `${production ? "https" : "http"}://${host}`) {
    return new Response(null, { status: 403 });
  }
}

export async function GET(request: Request) {
  const denied = deny(request);
  if (denied) return denied;
  try {
    const { rows } = await promptDb().query("SELECT * FROM budget_prompt_cells WHERE formula IS NOT NULL OR cell_value IS NOT NULL");
    return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load saved cells. Check the local database." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const denied = deny(request, true);
  if (denied) return denied;

  let sheet: string;
  let cell: string;
  let formula: string | null;
  let value: string | null;
  let researchPrompt: string | null;
  let schedule: ReturnType<typeof buildPromptSchedule>;
  let replaceSchedule: boolean;
  try {
    const body = await request.json();
    ({ sheet, cell, formula } = body);
    const isSalary = sheet === "settings" && cell === "salary" && formula === null;
    const isColumnWidth = sheet === "settings" && formula === null && isColumnLayoutKey(cell);
    if (!isSalary && !isColumnWidth && (!["budget", "retirement"].includes(sheet) || !/^[A-D](?:[1-9]|[1-4]\d|5[0-8])$/.test(cell))) {
      throw new Error("Invalid sheet or cell.");
    }
    if (formula !== null && (typeof formula !== "string" || formula.length > 4096)) throw new Error("Invalid formula.");
    value = formula === null ? body.value ?? "" : null;
    if (value !== null && (typeof value !== "string" || value.length > 4096)) throw new Error("Invalid cell value.");
    if (isSalary && (value === null || !value || !Number.isFinite(Number(value)) || Number(value) < 0)) {
      throw new Error("Enter a valid salary.");
    }
    if (isColumnWidth && !readColumnShares(value ?? undefined)) {
      throw new Error("Invalid column width.");
    }
    researchPrompt = formula === null ? null : promptText(formula);
    replaceSchedule = formula === null || body.schedule !== undefined;
    schedule = formula === null ? null : buildPromptSchedule(body.schedule);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid prompt." }, { status: 400 });
  }

  try {
    const { rows } = await promptDb().query(
      `WITH saved AS (
        INSERT INTO budget_prompt_cells
          (sheet, cell, formula, research_prompt, schedule, next_run_at, status, cell_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (sheet, cell) DO UPDATE SET
          version = budget_prompt_cells.version + 1, formula = EXCLUDED.formula,
          research_prompt = EXCLUDED.research_prompt,
          schedule = CASE WHEN $9 THEN EXCLUDED.schedule ELSE budget_prompt_cells.schedule END,
          next_run_at = EXCLUDED.next_run_at, status = EXCLUDED.status, cell_value = EXCLUDED.cell_value, result = NULL, error = NULL
        RETURNING *
      ), cancelled AS (
        UPDATE budget_prompt_runs r SET status = 'cancel_requested'
        FROM saved s WHERE r.sheet = s.sheet AND r.cell = s.cell AND r.version < s.version
          AND r.status = 'running'
      )
      SELECT * FROM saved`,
      [sheet, cell, formula, researchPrompt, schedule, formula ? new Date() : null,
        formula ? "queued" : "saved", value, replaceSchedule],
    );
    if (formula) after(async () => {
      if (process.env.VERCEL_ENV === "production") {
        await dispatchProductionPrompt();
        return;
      }
      const origin = process.env.NYC_BUDGET_EVE_URL ?? "http://127.0.0.1:2034";
      await fetch(`${origin}/eve/v1/dev/schedules/dispatch`, {
        method: "POST", signal: AbortSignal.timeout(310_000),
      }).catch(() => {});
    });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Could not save the cell. Check the local database." }, { status: 503 });
  }
}


export async function DELETE(request: Request) {
  const denied = deny(request, true);
  if (denied) return denied;
  try {
    // Keep the version counters so retired runs can never match a future formula.
    await promptDb().query("UPDATE budget_prompt_cells SET cell_value = NULL WHERE formula IS NULL AND NOT (sheet = 'settings' AND cell LIKE 'width:%')");
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Could not reset the saved cells." }, { status: 503 });
  }
}
