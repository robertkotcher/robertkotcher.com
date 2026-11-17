import { isRowColor, isRowColorKey } from "../../../nyc-budget/row-colors";
import { NextResponse } from "next/server";
import { promptDb } from "../../../nyc-budget/prompt-db";
import { shiftRowReferences } from "../../../nyc-budget/formulas";
import { budgetLayoutKey, budgetRowIds, maxBudgetRows, readRowChanges } from "../../../nyc-budget/budget-rows";
import { isColumnLayoutKey, readColumnShares } from "../../../nyc-budget/column-widths";
import { rowCount } from "../../../spain-budget/model";

export const runtime = "nodejs";
type RecordValue = { sheet: string; cell: string; formula: null; cell_value: string };
type Records = Record<string, RecordValue>;

function denied(request: Request, write = false) {
  const url = new URL(request.url);
  if (process.env.VERCEL_ENV !== "production" && !["localhost", "127.0.0.1"].includes(url.hostname)) return new Response(null, { status: 404 });
  if (write && request.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
}

async function storage(request: Request, write: boolean) {
  const denial = denied(request, write);
  if (denial) return denial;
  const db = await promptDb().connect();
  try {
    // A separate record keeps Spain values and layout independent of NYC.
    await db.query("CREATE TABLE IF NOT EXISTS spain_budget_state (id integer PRIMARY KEY, cells jsonb NOT NULL DEFAULT '{}'::jsonb)");
    await db.query("BEGIN");
    await db.query("INSERT INTO spain_budget_state (id) VALUES (1) ON CONFLICT DO NOTHING");
    const { rows } = await db.query<{ cells: Records }>("SELECT cells FROM spain_budget_state WHERE id=1 FOR UPDATE");
    const records = rows[0].cells;
    let result: RecordValue | RecordValue[] = Object.values(records);
    if (write) {
      const body = await request.json();
      const changes = readRowChanges(records["settings:" + budgetLayoutKey]?.cell_value);
      const ids = budgetRowIds(changes, rowCount);
      if (request.method === "PATCH") {
        const { row, insert, revision } = body;
        if (revision !== changes.length) throw new Error("Rows changed. Wait for refresh and try again.");
        if (!Number.isSafeInteger(row) || row < 1 || typeof insert !== "boolean" ||
          (insert ? row > ids.length + 1 || ids.length >= maxBudgetRows : row > ids.length || ids.length <= 1)) throw new Error("Invalid row change.");
        for (const [key, record] of Object.entries(records)) {
          if (record.sheet !== "budget") continue;
          if (!insert && Number(record.cell.slice(1)) === ids[row - 1]) delete records[key];
          else record.cell_value = shiftRowReferences(record.cell_value, row, insert);
        }
        records["settings:" + budgetLayoutKey] = { sheet: "settings", cell: budgetLayoutKey, formula: null, cell_value: JSON.stringify([...changes, { row, insert }]) };
        result = Object.values(records);
      } else {
        const { sheet, cell, value, formula, revision } = body;
        if (formula !== null) throw new Error("Research prompts are not configured for the Spain sheet.");
        if (typeof value !== "string" || value.length > 4096) throw new Error("Invalid value.");
        if (sheet === "settings") {
          if (cell === "salary") {
            if (!value || !Number.isFinite(Number(value)) || Number(value) < 80000 || Number(value) > 350000) throw new Error("Salary must be between $80,000 and $350,000.");
          } else if (isRowColorKey(cell)) {
            if (!isRowColor(value)) throw new Error("Invalid row color.");
          } else if (!isColumnLayoutKey(cell) || !readColumnShares(value)) throw new Error("Invalid setting.");
        } else if (sheet !== "budget" || typeof cell !== "string" || !/^[A-D][1-9]\d{0,2}$/.test(cell)) throw new Error("Invalid cell.");
        let address = cell;
        if (sheet === "budget") {
          if (revision !== changes.length) throw new Error("Rows changed. Wait for refresh and try again.");
          const id = ids[Number(cell.slice(1)) - 1];
          if (id === undefined) throw new Error("Invalid row.");
          address = cell[0] + id;
          if (address === "B3" && (!(Number(value) > 0) || !Number.isFinite(Number(value)))) throw new Error("Exchange rate must be a positive number.");
        }
        result = { sheet, cell: address, formula: null, cell_value: value };
        records[sheet + ":" + address] = result;
      }
      await db.query("UPDATE spain_budget_state SET cells=$1 WHERE id=1", [JSON.stringify(records)]);
    }
    await db.query("COMMIT");
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await db.query("ROLLBACK");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load or save Spain budget." }, { status: write ? 400 : 503 });
  } finally {
    db.release();
  }
}
export async function GET(request: Request) { return storage(request, false); }
export async function PUT(request: Request) { return storage(request, true); }
export async function PATCH(request: Request) { return storage(request, true); }
