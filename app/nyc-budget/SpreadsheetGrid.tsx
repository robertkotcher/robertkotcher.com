"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ScheduleSettings } from "./prompt-schedule";
import PromptScheduleEditor from "./PromptScheduleEditor";
import { type PromptJob } from "./prompt-formula";
import { evaluateSheet, type SheetCells } from "./formulas";

import { columns, minShare, totalShare, type ColumnShares } from "./column-widths";
import { effectiveTaxRateRow, taxRowCount } from "./taxes";
import { budgetTotals, expenseHeaderRow, maxBudgetRows, type RowChange } from "./budget-rows";
const rowIndexPercent = 6;
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type CellUndo = {
  previous: string;
  next: string;
  schedule?: ScheduleSettings | null;
};

export default function SpreadsheetGrid({
  cells, update, inputs, readOnlyCells, label, promptJobs, columnShares, onColumnResize,
  rowIds, rowsReady, changeRow,
}: {
  cells: SheetCells;
  rowIds: number[];
  rowsReady: boolean;
  changeRow: (change: RowChange) => Promise<void>;
  update: (address: string, value: string, schedule?: ScheduleSettings | null) => void;
  inputs: Record<string, number>;
  readOnlyCells: ReadonlySet<string>;
  label: string;
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

  const [taxesExpanded, setTaxesExpanded] = useState(false);
  const [savingRows, setSavingRows] = useState(false);
  const rowCount = rowIds.length;
  const firstTaxDetail = rowIds.includes(1) ? rowIds.indexOf(1) + 2
    : rowIds.findIndex((id) => id > 1 && id < taxRowCount) + 1;
  const taxSummary = rowIds.includes(taxRowCount) ? rowIds.indexOf(taxRowCount) + 1
    : rowIds.findLastIndex((id) => id > 1 && id < taxRowCount) + 2;
  const hasTaxDetails = firstTaxDetail > 0 && firstTaxDetail < taxSummary
    && (firstTaxDetail > 1 || taxSummary <= rowCount);
  const isTaxDetail = (row: number) => hasTaxDetails && row >= firstTaxDetail && row < taxSummary;
  const visibleRows = rowIds.map((_, index) => index + 1)
    .filter((row) => taxesExpanded || !isTaxDetail(row));
  const [selected, setSelected] = useState(`B${taxRowCount}`);
  const [previousRowIds, setPreviousRowIds] = useState(rowIds);
  const [cellExpanded, setCellExpanded] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function collapseOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !sheet.current?.contains(event.target)) {
        setCellExpanded(false);
      }
    }

    document.addEventListener("pointerdown", collapseOnOutsideClick);
    return () => document.removeEventListener("pointerdown", collapseOnOutsideClick);
  }, []);

  function expandCell(address: string) {
    setSelected(address);
    setCellExpanded(true);
  }
  const undo = useRef({ rowIds, cells: new Map<string, CellUndo>() });
  const [editing, setEditing] = useState<string>();
  const [draft, setDraft] = useState("");
  const read = useMemo(() => evaluateSheet(cells, rowCount, inputs), [cells, inputs, rowCount]);

  if (previousRowIds !== rowIds) {
    const previousIndex = Number(selected.slice(1)) - 1;
    const newIndex = rowIds.indexOf(previousRowIds[previousIndex]);
    const nextRow = newIndex === -1 ? Math.min(previousIndex + 1, rowCount) : newIndex + 1;
    setPreviousRowIds(rowIds);
    setSelected(selected[0] + (visibleRows.includes(nextRow) ? nextRow : visibleRows[0]));
    setEditing(undefined);
    setCellExpanded(false);
  }

  async function saveRowChange(change: RowChange, menu: HTMLElement) {
    menu.hidePopover();
    setSavingRows(true);
    await changeRow(change);
    setSavingRows(false);
  }

  function raw(address: string) {
    const job = readOnlyCells.has(address) ? undefined : promptJobs[address];
    return job?.formula ?? cells[address] ?? "";
  }

  function undoHistory() {
    // Saved formula text can change when rows move, so start a fresh history.
    if (undo.current.rowIds !== rowIds) undo.current = { rowIds, cells: new Map() };
    return undo.current.cells;
  }

  function saveCell(address: string, value: string) {
    const history = undoHistory();
    const previous = raw(address);
    if (value === previous) return;
    const job = promptJobs[address];
    const schedule = job?.schedule;
    let previousSchedule: ScheduleSettings | null | undefined;
    if (schedule) {
      const [minute, hour, day, , weekday] = schedule.cron.split(" ");
      previousSchedule = {
        cadence: schedule.cadence,
        timezone: schedule.timezone,
        time: [hour, minute].map((part) => part.padStart(2, "0")).join(":"),
        day: schedule.cadence === "weekly" ? weekday : day,
      };
    } else if (job) {
      previousSchedule = null;
    }
    history.set(address, { previous, next: value, schedule: previousSchedule });
    update(address, value);
  }

  function undoCell(address: string) {
    const history = undoHistory();
    const change = history.get(address);
    if (!change) return;
    history.delete(address);
    const current = raw(address);
    if (current === change.next || current === change.previous) {
      update(address, change.previous, change.schedule);
    }
  }

  function begin(address: string, value = raw(address)) {
    setSelected(address);
    setEditing(address);
    setDraft(value);
  }

  function commit(address: string) {
    if (editing === address) saveCell(address, draft);
    setEditing(undefined);
  }

  function cellKey(event: KeyboardEvent<HTMLElement>, address: string, editable: boolean) {
    const { key } = event;
    if (event.target !== event.currentTarget) return;
    const isEditing = editing === address;
    if (!isEditing && !readOnlyCells.has(address) && (event.ctrlKey || event.metaKey)
      && !event.shiftKey && !event.altKey && key.toLowerCase() === "z") {
      event.preventDefault();
      undoCell(address);
      return;
    }
    if (key === "Escape" && isEditing) {
      event.preventDefault();
      setEditing(undefined);
      return;
    }

    const row = Number(address.slice(1));
    const column = columns.findIndex((letter) => letter === address[0]);
    const rowIndex = visibleRows.indexOf(row);
    const direction = event.shiftKey ? -1 : 1;
    let nextAddress: string | undefined;
    const nextRow = key === "Enter" ? visibleRows[rowIndex + direction]
      : !isEditing && key === "ArrowUp" ? visibleRows[rowIndex - 1]
      : !isEditing && key === "ArrowDown" ? visibleRows[rowIndex + 1]
      : undefined;
    if (nextRow !== undefined) nextAddress = address[0] + nextRow;
    if (!isEditing) {
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
        saveCell(address, "");
      }
    }
    if (nextAddress) {
      event.preventDefault();
      const next = document.getElementById(`budget-cell-${nextAddress}`);
      if (next) next.focus();
    } else if (key === "Enter" && isEditing) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  function toggleTaxes() {
    const selectedRow = Number(selected.slice(1));
    if (taxesExpanded && isTaxDetail(selectedRow)) {
      setSelected(selected[0] + (taxSummary <= rowCount ? taxSummary : firstTaxDetail - 1));
      setCellExpanded(false);
    }
    setTaxesExpanded(!taxesExpanded);
  }

  const taxToggle = (
    <tr className="tax-breakdown-row">
      <td colSpan={columns.length + 1}>
        <button type="button" aria-expanded={taxesExpanded} onClick={toggleTaxes}>
          <span aria-hidden="true">{taxesExpanded ? "▾" : "▸"}</span>
          {taxesExpanded ? "Collapse tax rows" : "expand tax rows"}
        </button>
      </td>
    </tr>
  );

  const formulaReadOnly = readOnlyCells.has(selected);

  return (
    <div ref={sheet} inert={savingRows} aria-busy={savingRows}>
      <div className="formula-bar">
        <output aria-label="Selected cell">{selected}</output>
        <span aria-hidden="true">ƒx</span>
        <input aria-label="Formula bar" placeholder="Value or formula" maxLength={4096} readOnly={formulaReadOnly}
          value={editing === "formula" ? draft : raw(selected)}
          onFocus={() => {
            if (!formulaReadOnly) { setEditing("formula"); setDraft(raw(selected)); }
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => { if (editing === "formula") saveCell(selected, draft); setEditing(undefined); }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const cell = document.getElementById(`budget-cell-${selected}`);
              if (cell) cell.focus();
              else event.currentTarget.blur();
            }
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
            {visibleRows.map((row) => {
              const id = rowIds[row - 1];
              const menuId = `budget-row-menu-${id}`;
              return (
                <Fragment key={id}>
                  {hasTaxDetails && row === (taxesExpanded ? firstTaxDetail : taxSummary) && taxToggle}
                  <tr className={id === 1 || id === expenseHeaderRow ? "sheet-title-row" : budgetTotals.has(id) ? "subtotal" : undefined}>
                    <th scope="row" className={selected.slice(1) === String(row) ? "selected-header" : ""}>
                      <div className="budget-row-heading">
                        <button type="button" className="budget-row-options" aria-label={`Options for row ${row}`}
                          disabled={!rowsReady} popoverTarget={menuId}
                          onClick={(event) => {
                            const bounds = event.currentTarget.getBoundingClientRect();
                            const menu = document.getElementById(menuId);
                            if (menu) {
                              menu.style.left = `${bounds.left}px`;
                              menu.style.top = `${Math.min(bounds.bottom, window.innerHeight - 116)}px`;
                            }
                          }}>⋯</button>
                        <span>{row}</span>
                        <div id={menuId} className="budget-row-menu" popover="auto">
                          <button type="button" disabled={rowCount >= maxBudgetRows}
                            onClick={(event) => void saveRowChange({ row, insert: true }, event.currentTarget.parentElement!)}>
                            Insert row above
                          </button>
                          <button type="button" disabled={rowCount >= maxBudgetRows}
                            onClick={(event) => void saveRowChange({ row: row + 1, insert: true }, event.currentTarget.parentElement!)}>
                            Insert row below
                          </button>
                          <button type="button" disabled={rowCount <= 1}
                            onClick={(event) => void saveRowChange({ row, insert: false }, event.currentTarget.parentElement!)}>
                            Delete row
                          </button>
                        </div>
                      </div>
                    </th>
                    {columns.map((column) => {
                      const address = column + row;
                      const readOnly = readOnlyCells.has(address);
                      const job = readOnly ? undefined : promptJobs[address];
                      const loading = job?.status === "queued" || job?.status === "running";
                      const value = read(address);
                      const isSelected = selected === address;
                      const isEditing = isSelected && editing === address;
                      const isNote = column === "C" || column === "D";
                      const CellEditor = isNote ? "textarea" : "input";
                      const display = typeof value === "number" && column === "B" && id !== effectiveTaxRateRow ? currency.format(value) : String(value);
                      return (
                        <td key={address} className={isSelected ? "selected-cell" : undefined}
                          onClick={(event) => {
                            if (event.target === event.currentTarget) {
                              event.currentTarget.querySelector<HTMLElement>(".prompt-result, input, textarea")?.focus();
                            }
                          }}>
                          {job ? (
                            <div className="prompt-result" id={`budget-cell-${address}`} tabIndex={0}
                              aria-label={`Prompt cell ${address}`} onFocus={() => expandCell(address)}
                              onClick={() => expandCell(address)}
                              onKeyDown={(event) => cellKey(event, address, false)}>
                              <div className="prompt-result-line">
                                <PromptScheduleEditor key={job.version} cell={address} schedule={job.schedule}
                                  researchPrompt={job.research_prompt} loading={loading} update={update} />
                                {job.result && (isSelected && cellExpanded ? (
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
                                <small className="prompt-next-run">Next run {new Intl.DateTimeFormat("en-US", {
                                  timeZone: job.schedule.timezone, dateStyle: "medium", timeStyle: "short",
                                }).format(new Date(job.next_run_at))}</small>
                              )}
                              {!loading && job.status !== "complete" && <small>{job.error ?? job.status}</small>}
                            </div>
                          ) : <CellEditor id={`budget-cell-${address}`} aria-label={`Cell ${address}`} maxLength={4096} readOnly={readOnly || !isEditing}
                            className={isNote && isSelected && cellExpanded ? "expanded-note" : typeof value === "number" ? "numeric-cell" : undefined}
                            rows={isNote ? 1 : undefined}
                            value={isEditing ? draft : display}
                            onFocus={() => {
                              setSelected(address);
                              setCellExpanded(isNote);
                            }}
                            onClick={() => {
                              if (isNote) expandCell(address);
                              if (!readOnly && !isEditing) begin(address);
                            }}
                            onPaste={(event) => {
                              if (readOnly || isEditing) return;
                              event.preventDefault();
                              saveCell(address, event.clipboardData.getData("text/plain"));
                            }}
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={() => commit(address)}
                            onKeyDown={(event) => cellKey(event, address, !readOnly)} />}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
            {hasTaxDetails && !taxesExpanded && taxSummary > rowCount && taxToggle}
          </tbody>
        </table>
      </div>
    </div>
  );
}
