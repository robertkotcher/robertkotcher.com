"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ScheduleSettings } from "./prompt-schedule";
import PromptScheduleEditor from "./PromptScheduleEditor";
import { type PromptJob } from "./prompt-formula";
import expenses from "./expenses.json";
import { evaluateSheet, type SheetCells } from "./formulas";

import { columns, minShare, totalShare, type ColumnShares } from "./column-widths";
import { annualTaxTotalRow, effectiveTaxRateRow, taxRowCount } from "./taxes";
const rowIndexPercent = 6;
const expenseHeaderRow = taxRowCount + 2;
const firstExpenseRow = expenseHeaderRow + 1;
const takeHomeRow = expenseHeaderRow + expenses.length + 12;
const totalRow = takeHomeRow + 1;
export const budgetRowCount = totalRow + 8;
export const budgetTotals = new Set([annualTaxTotalRow, taxRowCount, takeHomeRow, totalRow, totalRow + 3]);
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const defaultExpenseCells: SheetCells = {
  [`A${expenseHeaderRow}`]: "Expenses",
  [`B${expenseHeaderRow}`]: "Monthly amount",
  [`C${expenseHeaderRow}`]: "Notes",
  [`D${expenseHeaderRow}`]: "Notes 2",
  [`A${takeHomeRow}`]: "Estimated monthly take-home",
  [`B${takeHomeRow}`]: `=B${taxRowCount}`,
  ...Object.fromEntries(expenses.flatMap(({ label, center }, index) => [
    [`A${index + firstExpenseRow}`, label],
    [`B${index + firstExpenseRow}`, String(center)],
  ])),
  [`A${totalRow}`]: "Total monthly expenses",
  [`B${totalRow}`]: `=SUM(B${firstExpenseRow}:B${takeHomeRow - 1})`,
  [`A${totalRow + 1}`]: "Available to save",
  [`B${totalRow + 1}`]: `=B${takeHomeRow}-B${totalRow}`,
  [`A${totalRow + 2}`]: "Planned retirement contributions",
  [`B${totalRow + 2}`]: "=RETIREMENT",
  [`A${totalRow + 3}`]: "Cash remaining after contributions",
  [`B${totalRow + 3}`]: `=B${totalRow + 1}-B${totalRow + 2}`,
};

export default function SpreadsheetGrid({
  cells, update, inputs, readOnlyCells, label, help, promptJobs, columnShares, onColumnResize,
}: {
  cells: SheetCells;
  update: (address: string, value: string, schedule?: ScheduleSettings | null) => void;
  inputs: Record<string, number>;
  readOnlyCells: ReadonlySet<string>;
  label: string;
  help?: string;
  promptJobs: Record<string, PromptJob>;
  columnShares: ColumnShares;
  onColumnResize: (shares: ColumnShares) => void;
}) {
  const [preview, setPreview] = useState<ColumnShares>();
  const shares = preview ?? columnShares;
  const table = useRef<HTMLTableElement>(null);
  const drag = useRef<{ startX: number; usableWidth: number; shares: ColumnShares } | null>(null);

  function moveDivider(index: number, start: ColumnShares, pixels: number, usableWidth: number): ColumnShares {
    const delta = Math.round(pixels / usableWidth * totalShare);
    const pair = start[index] + start[index + 1];
    const left = Math.max(minShare, Math.min(pair - minShare, start[index] + delta));
    const next: ColumnShares = [...start];
    next[index] = left;
    next[index + 1] = pair - left;
    return next;
  }

  function usableWidth() {
    return Math.max(1, (table.current?.clientWidth ?? 0) * (1 - rowIndexPercent / 100));
  }

  const [selected, setSelected] = useState("B2");
  const [promptExpanded, setPromptExpanded] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function collapseOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !sheet.current?.contains(event.target)) {
        setPromptExpanded(false);
      }
    }

    document.addEventListener("pointerdown", collapseOnOutsideClick);
    return () => document.removeEventListener("pointerdown", collapseOnOutsideClick);
  }, []);

  function selectPrompt(address: string) {
    setSelected(address);
    setPromptExpanded(true);
  }
  const [editing, setEditing] = useState<string>();
  const [draft, setDraft] = useState("");
  const read = useMemo(() => evaluateSheet(cells, budgetRowCount, inputs), [cells, inputs]);

  function raw(address: string) {
    const job = readOnlyCells.has(address) ? undefined : promptJobs[address];
    return job?.formula ?? cells[address] ?? "";
  }

  function begin(address: string, value = raw(address)) {
    setSelected(address);
    setEditing(address);
    setDraft(value);
  }

  function commit(address: string) {
    if (editing === address && draft !== raw(address)) update(address, draft);
    setEditing(undefined);
  }

  function cellKey(event: KeyboardEvent<HTMLElement>, address: string, editable: boolean) {
    const { key } = event;
    if (event.target !== event.currentTarget) return;
    const isEditing = editing === address;
    if (key === "Escape" && isEditing) {
      event.preventDefault();
      setEditing(undefined);
      return;
    }

    const row = Number(address.slice(1));
    const column = columns.findIndex((letter) => letter === address[0]);
    const direction = event.shiftKey ? -1 : 1;
    let nextAddress: string | undefined;
    if (key === "Enter") nextAddress = address[0] + (row + direction);
    if (!isEditing) {
      if (key === "ArrowUp") nextAddress = address[0] + (row - 1);
      if (key === "ArrowDown") nextAddress = address[0] + (row + 1);
      if (key === "ArrowLeft" || key === "ArrowRight") {
        const nextColumn = columns[column + (key === "ArrowLeft" ? -1 : 1)];
        if (nextColumn) nextAddress = nextColumn + row;
      }
      if (editable && key === "F2") {
        event.preventDefault();
        begin(address);
      } else if (editable && key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        begin(address, key);
      } else if (editable && (key === "Backspace" || key === "Delete")) {
        event.preventDefault();
        update(address, "");
      }
    }
    if (nextAddress) {
      event.preventDefault();
      const next = document.getElementById(`budget-cell-${nextAddress}`);
      if (next) next.focus();
      else if (key === "Enter" && isEditing) event.currentTarget.blur();
    }
  }

  const formulaReadOnly = readOnlyCells.has(selected);

  return (
    <div ref={sheet}>
      <div className="formula-bar">
        <output aria-label="Selected cell">{selected}</output>
        <span aria-hidden="true">ƒx</span>
        <input aria-label="Formula bar" placeholder="Value or formula" maxLength={4096} readOnly={formulaReadOnly}
          value={editing === "formula" ? draft : raw(selected)}
          onFocus={() => {
            if (!formulaReadOnly) { setEditing("formula"); setDraft(raw(selected)); }
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => { if (editing === "formula" && draft !== raw(selected)) update(selected, draft); setEditing(undefined); }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setDraft(raw(selected));
          }} />
      </div>
      <div className="sheet-scroll" tabIndex={0} role="region" aria-label={label}>
        <table className="dui-table sheet-table cash-grid" ref={table}>
          <colgroup>
            <col style={{ width: `${rowIndexPercent}%` }} />
            {columns.map((column, index) => {
              const fraction = shares[index] / totalShare;
              return <col key={column} style={{ width: `${fraction * (100 - rowIndexPercent)}%` }} />;
            })}
          </colgroup>
          <thead><tr><th aria-label="Row number" />{columns.map((column, index) => (
            <th key={column} scope="col" className={selected[0] === column ? "selected-header" : ""}>
              <span className="column-label">{column}</span>
              {index < columns.length - 1 && <span className="column-resize" role="separator" tabIndex={0}
                aria-label={`Resize columns ${column} and ${columns[index + 1]}`} aria-orientation="vertical"
                aria-valuemin={minShare / 100} aria-valuemax={(shares[index] + shares[index + 1] - minShare) / 100}
                aria-valuenow={shares[index] / 100}
                onPointerDown={(event) => {
                  if (!event.isPrimary || event.button !== 0) return;
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  drag.current = { startX: event.clientX, usableWidth: usableWidth(), shares };
                }}
                onPointerMove={(event) => {
                  if (!drag.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                  setPreview(moveDivider(index, drag.current.shares, event.clientX - drag.current.startX, drag.current.usableWidth));
                }}
                onPointerUp={(event) => {
                  if (!drag.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                  const next = moveDivider(index, drag.current.shares, event.clientX - drag.current.startX, drag.current.usableWidth);
                  if (next[index] !== drag.current.shares[index]) onColumnResize(next);
                }}
                onLostPointerCapture={() => { drag.current = null; setPreview(undefined); }}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  onColumnResize(moveDivider(index, shares, event.key === "ArrowLeft" ? -10 : 10, usableWidth()));
                }} />}
            </th>
          ))}</tr></thead>
          <tbody>
            {Array.from({ length: budgetRowCount }, (_, rowIndex) => {
              const row = rowIndex + 1;
              return (
                <tr key={row} className={row === 1 || row === expenseHeaderRow ? "sheet-title-row" : budgetTotals.has(row) ? "subtotal" : undefined}>
                  <th scope="row" className={selected.slice(1) === String(row) ? "selected-header" : ""}>{row}</th>
                  {columns.map((column) => {
                    const address = column + row;
                    const readOnly = readOnlyCells.has(address);
                    const job = readOnly ? undefined : promptJobs[address];
                    const loading = job?.status === "queued" || job?.status === "running";
                    const value = read(address);
                    const isSelected = selected === address;
                    const isEditing = isSelected && editing === address;
                    const display = typeof value === "number" && column === "B" && row !== effectiveTaxRateRow ? currency.format(value) : String(value);
                    return (
                      <td key={address} className={isSelected ? "selected-cell" : undefined}
                        onClick={(event) => {
                          if (event.target === event.currentTarget) {
                            event.currentTarget.querySelector<HTMLElement>(".prompt-result, input")?.focus();
                          }
                        }}>
                        {job ? (
                          <div className="prompt-result" id={`budget-cell-${address}`} tabIndex={0}
                            aria-label={`Prompt cell ${address}`} onFocus={() => selectPrompt(address)}
                            onClick={() => selectPrompt(address)}
                            onKeyDown={(event) => cellKey(event, address, false)}>
                            <div className="prompt-result-line">
                              <PromptScheduleEditor key={job.version} cell={address} schedule={job.schedule}
                                researchPrompt={job.research_prompt} update={update} />
                              {job.result && (isSelected && promptExpanded ? (
                                <div className="prompt-result-markdown">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml
                                    allowedElements={["a", "p", "ul", "ol", "li", "strong", "em", "code", "pre", "br", "del",
                                      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "hr"]}
                                    unwrapDisallowed>
                                    {job.result}
                                  </ReactMarkdown>
                                </div>
                              ) : <span className="prompt-result-preview">{job.result}</span>)}
                            </div>
                            {job.schedule && job.next_run_at && job.status !== "queued" && (
                              <small>Next run {new Intl.DateTimeFormat("en-US", {
                                timeZone: job.schedule.timezone, dateStyle: "medium", timeStyle: "short",
                              }).format(new Date(job.next_run_at))}</small>
                            )}
                            {loading ? (
                              <small role="status" aria-label="Waiting for prompt results">
                                <span className="prompt-spinner" aria-hidden="true" />
                              </small>
                            ) : job.status !== "complete" && <small>{job.error ?? job.status}</small>}
                          </div>
                        ) : <input id={`budget-cell-${address}` } aria-label={`Cell ${address}`} maxLength={4096} readOnly={readOnly || !isEditing}
                          className={typeof value === "number" ? "numeric-cell" : undefined}
                          value={isEditing ? draft : display}
                          onFocus={() => setSelected(address)}
                          onDoubleClick={() => { if (!readOnly) begin(address); }}
                          onPaste={(event) => {
                            if (readOnly || isEditing) return;
                            event.preventDefault();
                            update(address, event.clipboardData.getData("text/plain"));
                          }}
                          onChange={(event) => setDraft(event.target.value)}
                          onBlur={() => commit(address)}
                          onKeyDown={(event) => cellKey(event, address, !readOnly)} />}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {help && <p className="grid-help">{help}</p>}
    </div>
  );
}
