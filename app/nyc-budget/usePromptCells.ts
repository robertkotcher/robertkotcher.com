"use client";

import { useEffect, useRef, useState } from "react";
import type { ScheduleSettings } from "./prompt-schedule";
import { isPromptFormula, type PromptJob } from "./prompt-formula";

import { isColumnWidthKey } from "./column-widths";

type StoredCell = (PromptJob & { cell_value: null }) | {
  sheet: string;
  cell: string;
  formula: null;
  cell_value: string;
};

const endpoint = "/api/nyc-budget/prompts";
const keyFor = (sheet: string, cell: string) => `${sheet}:${cell}`;

export function usePromptCells() {
  const [records, setRecords] = useState<Record<string, StoredCell>>({});
  const [toast, setToast] = useState<{ text: string; error: boolean }>();
  const writes = useRef(Promise.resolve());
  const pending = useRef(0);
  const revision = useRef(0);

  useEffect(() => {
    const abort = new AbortController();
    async function refresh() {
      const observedRevision = revision.current;
      try {
        const response = await fetch(endpoint, { signal: abort.signal, cache: "no-store" });
        if (!response.ok) return;
        const rows: StoredCell[] = await response.json();
        if (!abort.signal.aborted && observedRevision === revision.current && pending.current === 0) {
          setRecords(Object.fromEntries(rows.map((record) => [keyFor(record.sheet, record.cell), record])));
        }
      } catch {
        // A temporary connection failure leaves the previous values visible.
      }
    }
    void refresh();
    const timer = setInterval(refresh, 2500);
    return () => { abort.abort(); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  function jobsFor(sheet: string) {
    return Object.fromEntries(Object.values(records).flatMap((record) =>
      record.sheet === sheet && record.formula !== null ? [[record.cell, record]] : [],
    ));
  }

  function valuesFor(sheet: string) {
    return Object.fromEntries(Object.values(records).flatMap((record) =>
      record.sheet === sheet && record.formula === null ? [[record.cell, record.cell_value]] : [],
    ));
  }

  function enqueue(write: () => Promise<void>) {
    pending.current++;
    revision.current++;
    writes.current = writes.current.then(write).catch((error) => {
      setToast({ text: error instanceof Error ? error.message : "Could not save the cell.", error: true });
    }).finally(() => {
      pending.current--;
      revision.current++;
    });
  }

  function edit(sheet: string, cell: string, value: string, schedule?: ScheduleSettings | null) {
    const key = keyFor(sheet, cell);
    const formula = sheet !== "settings" && isPromptFormula(value) ? value : null;
    const existing = records[key];
    if (schedule === undefined && formula === (existing?.formula ?? null) && (formula || existing?.cell_value === value) && pending.current === 0) return;

    if (sheet === "settings" && isColumnWidthKey(cell)) {
      setRecords((previous) => ({ ...previous, [key]: { sheet, cell, formula: null, cell_value: value } }));
    }

    enqueue(async () => {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet, cell, value, formula, schedule }),
      });
      if (response.status === 404) {
        if (formula) throw new Error("Prompt cells are available in the local budget preview.");
        setRecords((previous) => ({ ...previous, [key]: { sheet, cell, formula: null, cell_value: value } }));
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save the cell.");
      if (sheet !== "settings" || !isColumnWidthKey(cell)) setRecords((previous) => ({ ...previous, [key]: result }));
      if (formula || existing?.formula) {
        setToast({ text: `${cell} · Prompt ${formula === null ? "deleted" : existing?.formula ? "updated" : "created"}.`, error: false });
      }
    });
  }

  return { jobsFor, valuesFor, edit, toast };
}
