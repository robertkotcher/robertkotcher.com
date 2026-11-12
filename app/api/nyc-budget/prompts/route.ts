import type { PoolClient } from "pg";
import { after, NextResponse } from "next/server";
import { promptDb } from "../../../nyc-budget/prompt-db";
import { budgetLayoutKey, budgetRowIds, maxBudgetRows, readRowChanges } from "../../../nyc-budget/budget-rows";
import { shiftRowReferences } from "../../../nyc-budget/formulas";
import { promptText } from "../../../nyc-budget/prompt-formula";
import { buildPromptSchedule } from "../../../nyc-budget/prompt-schedule";

import { columns, isColumnLayoutKey, readColumnShares } from "../../../nyc-budget/column-widths";

import { budgetAuthorized } from "../../../nyc-budget/budget-auth";
import { dispatchProductionPrompt } from "../../../nyc-budget/production-prompts";

export const maxDuration = 120;
export const runtime = "nodejs";

function deny(request: Request, write = false) {
  const host = request.headers.get("host") ?? "";
  const production = process.env.VERCEL_ENV === "production";
  if (production) {
    if (!budgetAuthorized(request.headers)) return new Response(null, { status: 404 });
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

async function withBudgetLayout(write: (db: PoolClient) => Promise<Response>) {
  const db = await promptDb().connect();
  try {
    await db.query("BEGIN");
    // Serialize row changes with edits addressed by a visible row number.
    await db.query("SELECT pg_advisory_xact_lock(70421813)");
    const response = await write(db);
    await db.query("COMMIT");
    return response;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}

async function loadRowChanges(db: PoolClient) {
  const { rows: [layout] } = await db.query<{ cell_value: string }>(
    "SELECT cell_value FROM budget_prompt_cells WHERE sheet = 'settings' AND cell = $1",
    [budgetLayoutKey],
  );
  return readRowChanges(layout?.cell_value);
}

function layoutConflict() {
  return NextResponse.json({ error: "The rows changed in another tab. Try again once the sheet refreshes." }, { status: 409 });
}

export async function PATCH(request: Request) {
  const denied = deny(request, true);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const row = body?.row;
  const insert = body?.insert;
  if (!Number.isSafeInteger(row) || row < 1 || typeof insert !== "boolean") {
    return NextResponse.json({ error: "Invalid row change." }, { status: 400 });
  }

  try {
    return await withBudgetLayout(async (db) => {
      const changes = await loadRowChanges(db);
      if (body.revision !== changes.length) return layoutConflict();
      const ids = budgetRowIds(changes);
      if (insert ? row > ids.length + 1 || ids.length >= maxBudgetRows : row > ids.length || ids.length === 1) {
        return NextResponse.json({ error: "Cannot add or remove a row here." }, { status: 400 });
      }

      if (!insert) {
        await db.query(`
          UPDATE budget_prompt_cells
          SET version = version + 1, formula = NULL, research_prompt = NULL, schedule = NULL,
              next_run_at = NULL, cell_value = NULL, result = NULL, error = NULL, status = 'saved'
          WHERE sheet = 'budget' AND cell = ANY($1)
        `, [columns.map((column) => column + ids[row - 1])]);
      }

      const { rows: formulas } = await db.query<{ cell: string; cell_value: string }>(`
        SELECT cell, cell_value FROM budget_prompt_cells
        WHERE sheet = 'budget' AND cell_value IS NOT NULL
      `);
      const shifted = formulas.flatMap(({ cell, cell_value }) => {
        const value = shiftRowReferences(cell_value, row, insert);
        return value === cell_value ? [] : [{ cell, value }];
      });
      if (shifted.length) {
        await db.query(`
          UPDATE budget_prompt_cells AS saved
          SET cell_value = changed.value
          FROM jsonb_to_recordset($1::jsonb) AS changed(cell text, value text)
          WHERE saved.sheet = 'budget' AND saved.cell = changed.cell
        `, [JSON.stringify(shifted)]);
      }

      await db.query(`
        INSERT INTO budget_prompt_cells (sheet, cell, cell_value, status)
        VALUES ('settings', $1, $2, 'saved')
        ON CONFLICT (sheet, cell) DO UPDATE SET cell_value = EXCLUDED.cell_value
      `, [budgetLayoutKey, JSON.stringify([...changes, { row, insert }])]);

      const { rows } = await db.query("SELECT * FROM budget_prompt_cells WHERE formula IS NOT NULL OR cell_value IS NOT NULL");
      return NextResponse.json(rows);
    });
  } catch {
    return NextResponse.json({ error: "Could not save the row change." }, { status: 503 });
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
  let revision: number | undefined;
  try {
    const body = await request.json();
    ({ sheet, cell, formula, revision } = body);
    const isSalary = sheet === "settings" && cell === "salary" && formula === null;
    const isColumnWidth = sheet === "settings" && formula === null && isColumnLayoutKey(cell);
    if (!isSalary && !isColumnWidth && (!["budget", "retirement"].includes(sheet) || !(sheet === "budget" ? /^[A-D][1-9]\d{0,2}$/ : /^[A-D](?:[1-9]|[1-4]\d|5[0-8])$/).test(cell))) {
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
    const save = async (db: PoolClient | ReturnType<typeof promptDb>, address: string) => {
      const { rows } = await db.query(
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
        [sheet, address, formula, researchPrompt, schedule, formula ? new Date() : null,
          formula ? "queued" : "saved", value, replaceSchedule],
      );
      return NextResponse.json(rows[0]);
    };
    const response = sheet === "budget" ? await withBudgetLayout(async (db) => {
      const changes = await loadRowChanges(db);
      if ((revision ?? 0) !== changes.length) return layoutConflict();
      const id = budgetRowIds(changes)[Number(cell.slice(1)) - 1];
      if (id === undefined) return NextResponse.json({ error: "Invalid row." }, { status: 400 });
      return save(db, cell[0] + id);
    }) : await save(promptDb(), cell);
    if (formula && response.ok) after(async () => {
      if (process.env.VERCEL_ENV === "production") {
        await dispatchProductionPrompt();
        return;
      }
      const origin = process.env.NYC_BUDGET_EVE_URL ?? "http://127.0.0.1:2034";
      await fetch(`${origin}/eve/v1/dev/schedules/dispatch`, {
        method: "POST", signal: AbortSignal.timeout(310_000),
      }).catch(() => {});
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Could not save the cell. Check the local database." }, { status: 503 });
  }
}


export async function DELETE(request: Request) {
  const denied = deny(request, true);
  if (denied) return denied;
  try {
    // Keep the version counters so retired runs can never match a future formula.
    await promptDb().query("UPDATE budget_prompt_cells SET cell_value = NULL WHERE formula IS NULL AND NOT (sheet = 'settings' AND (cell LIKE 'width:%' OR cell = $1))", [budgetLayoutKey]);
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Could not reset the saved cells." }, { status: 503 });
  }
}
