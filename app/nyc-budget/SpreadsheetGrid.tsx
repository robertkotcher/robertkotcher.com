"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ScheduleSettings } from "./prompt-schedule";
import PromptScheduleEditor from "./PromptScheduleEditor";
import { type PromptJob } from "./prompt-formula";
import expenses from "./expenses.json";
import { evaluateSheet, type SheetCells } from "./formulas";

import { columns, minShare, totalShare, type ColumnShares } from "./column-widths";
const rowIndexPercent = 6;
const takeHomeRow = expenses.length + 13;
const totalRow = takeHomeRow + 1;
export const cashFlowRowCount = totalRow + 8;
export const cashFlowTotals = new Set([takeHomeRow, totalRow, totalRow + 3]);
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const defaultCashFlowCells: SheetCells = {
  A1: "Item",
  B1: "Monthly amount",
  C1: "Notes",
  [`A${takeHomeRow}`]: "Estimated monthly take-home",
  [`B${takeHomeRow}`]: "=TAKE_HOME",
  ...Object.fromEntries(expenses.flatMap(({ label, center }, index) => [
    [`A${index + 2}`, label],
    [`B${index + 2}`, String(center)],
  ])),
  [`A${totalRow}`]: "Total monthly expenses",
  [`B${totalRow}`]: `=SUM(B2:B${takeHomeRow - 1})`,
  [`A${totalRow + 1}`]: "Available to save",
  [`B${totalRow + 1}`]: `=B${takeHomeRow}-B${totalRow}`,
  [`A${totalRow + 2}`]: "Planned retirement contributions",
  [`B${totalRow + 2}`]: "=RETIREMENT",
  [`A${totalRow + 3}`]: "Cash remaining after contributions",
  [`B${totalRow + 3}`]: `=B${totalRow + 1}-B${totalRow + 2}`,
};

export default function SpreadsheetGrid({ cells, update, inputs, rowCount, totals, label, currencyColumns = "B", plainRows, help, titleRow, promptJobs, columnShares, onColumnResize }: {
  cells: SheetCells;
  columnShares: ColumnShares;
  onColumnResize: (shares: ColumnShares) => void;
  update: (address: string, value: string, schedule?: ScheduleSettings | null) => void;
  inputs?: Record<string, number>;
  rowCount: number;
  totals?: ReadonlySet<number>;
  label: string;
  currencyColumns?: string;
  plainRows?: ReadonlySet<number>;
  help?: string;
  promptJobs?: Record<string, PromptJob>;
  titleRow?: boolean;
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
  const [editing, setEditing] = useState<string>();
  const [draft, setDraft] = useState("");
  const read = useMemo(() => evaluateSheet(cells, rowCount, inputs ?? {}), [cells, rowCount, inputs]);
  const raw = (address: string) => promptJobs?.[address]?.formula ?? cells[address] ?? "";

  function begin(address: string) {
    setSelected(address);
    setEditing(address);
    setDraft(raw(address));
  }

  function commit(address: string) {
    if (editing === address && draft !== raw(address)) update(address, draft);
    setEditing(undefined);
  }

  function cellKey(event: KeyboardEvent<HTMLInputElement>, address: string) {
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(raw(address));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const nextRow = Number(address.slice(1)) + (event.shiftKey ? -1 : 1);
      const next = document.getElementById(`budget-cell-${address[0]}${nextRow}`);
      if (next) next.focus();
      else event.currentTarget.blur();
    }
  }

  return (
    <>
      <div className="formula-bar">
        <output aria-label="Selected cell">{selected}</output>
        <span aria-hidden="true">ƒx</span>
        <input aria-label="Formula bar" placeholder="Value or formula" maxLength={4096}
          value={editing === "formula" ? draft : raw(selected)}
          onFocus={() => { setEditing("formula"); setDraft(raw(selected)); }}
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
            {Array.from({ length: rowCount }, (_, index) => {
              const row = index + 1;
              return (
                <tr key={row} className={titleRow && row === 1 ? "sheet-title-row" : totals?.has(row) ? "subtotal" : undefined}>
                  <th scope="row" className={selected.slice(1) === String(row) ? "selected-header" : ""}>{row}</th>
                  {columns.map((column) => {
                    const address = column + row;
                    const job = promptJobs?.[address];
                    const loading = job?.status === "queued" || job?.status === "running";
                    const value = read(address);
                    const display = typeof value === "number" && currencyColumns.includes(column) && !plainRows?.has(row) ? currency.format(value) : String(value);
                    return (
                      <td key={address} className={selected === address ? "selected-cell" : undefined}
                        onClick={(event) => {
                          if (event.target === event.currentTarget) {
                            event.currentTarget.querySelector("input")?.focus();
                          }
                        }}>
                        {job && editing !== address ? (
                          <div className="prompt-result" id={`budget-cell-${address}`} tabIndex={0}
                            aria-label={`Prompt cell ${address}`} onFocus={() => setSelected(address)}
                            onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("a")) begin(address); }}
                            onKeyDown={(event) => {
                              if (event.target === event.currentTarget && (event.key === "Enter" || event.key === "F2")) {
                                event.preventDefault();
                                begin(address);
                              }
                            }}>
                            <PromptScheduleEditor key={job.version} cell={address} schedule={job.schedule}
                              researchPrompt={job.research_prompt} update={update} />
                            {job.result && <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml
                              allowedElements={["a", "p", "ul", "ol", "li", "strong", "em", "code", "pre", "br", "del",
                                "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "hr"]}
                              unwrapDisallowed>
                              {job.result}
                            </ReactMarkdown>}
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
                        ) : <input id={`budget-cell-${address}` } aria-label={`Cell ${address}`} maxLength={4096}
                          className={typeof value === "number" ? "numeric-cell" : undefined}
                          autoFocus={Boolean(job && editing === address)}
                          value={editing === address ? draft : display}
                          onFocus={(event) => { begin(address); event.currentTarget.select(); }}
                          onChange={(event) => setDraft(event.target.value)}
                          onBlur={() => commit(address)}
                          onKeyDown={(event) => cellKey(event, address)} />}
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
    </>
  );
}
