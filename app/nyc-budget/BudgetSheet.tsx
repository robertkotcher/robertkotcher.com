"use client";

import { useMemo, useState } from "react";
import SpreadsheetGrid from "./SpreadsheetGrid";
import { budgetDefaults, budgetLayoutKey, budgetRowIds, readRowChanges } from "./budget-rows";
import { columnLayoutKey, columns, sheetColumnShares, type ColumnShares } from "./column-widths";
import { usePromptCells } from "./usePromptCells";
import { evaluateSheet, type SheetCells } from "./formulas";
import { brooklynTaxCells, taxRowCount } from "./taxes";
import type { RetirementPlan } from "./retirement";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0,
});
const dollars = (value: number) => currency.format(value);
const defaultSalary = 250_000;
const minSalary = 220_000;
const maxSalary = 320_000;
const salaryStep = 10_000;
const places = ["NJ towns", "Brooklyn"] as const;
const salaryNotches = Array.from({ length: (maxSalary - minSalary) / salaryStep + 1 },
  (_, index) => minSalary + index * salaryStep);

const planCells = [
  ["cash", "Starting savings"], ["stocks", "Starting stocks"], ["bonds", "Starting bonds"],
  ["payroll", "Monthly retirement contribution"], ["surplus", "Monthly surplus invested"],
  ["spending", "Monthly retirement spending in today's dollars"],
  ["month3", "Month 3 transfer to stocks"], ["month9", "Month 9 transfer to stocks"],
] as const;

const calculatedTaxCells = new Set(Array.from({ length: taxRowCount - 2 }, (_, index) => `B${index + 3}`));
function planToCells(plan: RetirementPlan): SheetCells {
  return Object.fromEntries(planCells.flatMap(([key, label], index) => [
    [`A${index + 1}`, label], [`B${index + 1}`, String(plan[key])],
  ]));
}

export default function BudgetSheet({ initialPlan, endpoint }: { initialPlan: RetirementPlan; endpoint: string }) {
  const prompts = usePromptCells(endpoint);
  const settings = prompts.valuesFor("settings");
  const gridSizing = {
    columnShares: sheetColumnShares(settings, "cash-flow"),
    onColumnResize: (shares: ColumnShares) =>
      prompts.edit("settings", columnLayoutKey("cash-flow"), shares.join(",")),
  };
  const [place, setPlace] = useState<(typeof places)[number]>("NJ towns");
  const brooklyn = place === "Brooklyn";
  const [salaryDraft, setSalaryDraft] = useState<number>();
  const savedSalary = Number(settings.salary ?? defaultSalary);
  const salary = salaryDraft ?? savedSalary;
  const sliderSalary = salaryDraft ?? Math.min(maxSalary, Math.max(minSalary,
    minSalary + Math.round((savedSalary - minSalary) / salaryStep) * salaryStep));
  const savedCells = prompts.valuesFor("budget");
  const savedJobs = prompts.jobsFor("budget");
  const layout = settings[budgetLayoutKey];
  const { changes, rowIds } = useMemo(() => {
    const changes = readRowChanges(layout);
    return { changes, rowIds: budgetRowIds(changes) };
  }, [layout]);
  const defaults = useMemo(() => budgetDefaults(changes, brooklyn), [changes, brooklyn]);
  const cells = { ...defaults };
  const jobs: typeof savedJobs = {};
  const readOnlyCells = new Set<string>();
  rowIds.forEach((id, index) => {
    for (const column of columns) {
      const storageCell = column + id;
      const address = column + (index + 1);
      if (calculatedTaxCells.has(storageCell) || (brooklyn && Object.hasOwn(brooklynTaxCells, storageCell))) readOnlyCells.add(address);
      else if (Object.hasOwn(savedCells, storageCell)) cells[address] = savedCells[storageCell];
      else if (savedJobs[storageCell]) jobs[address] = savedJobs[storageCell];
    }
  });
  const retirement = { ...planToCells(initialPlan), ...prompts.valuesFor("retirement") };
  const readPlan = evaluateSheet(retirement, 18, {});
  const plan = Object.fromEntries(planCells.map(([key], index) => {
    const value = readPlan(`B${index + 1}`);
    return [key, typeof value === "number" ? Math.max(0, value) : 0];
  })) as RetirementPlan;
  const contribution = plan.payroll + plan.surplus;

  return (
    <main className="budget-sheet" data-theme="light">
      <div className="budget-wrap">
        <header className="budget-header">
          <h1 className="budget-title">NYC area cost of living</h1>
          <div className="budget-header-controls">
            <div className="budget-setting">
              <span>Places to live</span>
              <button type="button" className="budget-setting-link" popoverTarget="budget-place-picker">
                {place}
              </button>
              <div id="budget-place-picker" className="budget-setting-popover" popover="auto">
                {places.map((option) => (
                  <button key={option} type="button" className="budget-place-option" popoverTarget="budget-place-picker"
                    popoverTargetAction="hide" aria-pressed={place === option} autoFocus={place === option}
                    onClick={() => setPlace(option)}>
                    {option} {place === option && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="budget-setting">
              <span>Annual base salary</span>
              <button type="button" className="budget-setting-link" popoverTarget="budget-salary-editor">
                {dollars(savedSalary)}
              </button>
              <form id="budget-salary-editor" className="budget-setting-popover budget-salary-editor" popover="auto"
                onToggle={(event) => { if (event.newState === "closed") setSalaryDraft(undefined); }}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (sliderSalary !== savedSalary) prompts.edit("settings", "salary", String(sliderSalary));
                  event.currentTarget.hidePopover();
                }}>
                <div className="budget-salary-slider-heading">
                  <label htmlFor="budget-salary">Annual base salary</label>
                  <output htmlFor="budget-salary">{dollars(sliderSalary)}</output>
                </div>
                <input id="budget-salary" type="range" min={minSalary} max={maxSalary} step={salaryStep}
                  list="budget-salary-notches" autoFocus value={sliderSalary} aria-valuetext={dollars(sliderSalary)}
                  onChange={(event) => setSalaryDraft(event.currentTarget.valueAsNumber)} />
                <datalist id="budget-salary-notches">
                  {salaryNotches.map((amount) => <option key={amount} value={amount} />)}
                </datalist>
                <div className="budget-salary-slider-range" aria-hidden="true">
                  <span>{dollars(minSalary)}</span>
                  <span>{dollars(maxSalary)}</span>
                </div>
                <button type="submit" className="dui-btn dui-btn-sm">Save</button>
              </form>
            </div>
          </div>
        </header>

        <section aria-label="Cash flow">
          <SpreadsheetGrid {...gridSizing} label="Income, taxes, and expenses"
            cells={cells} readOnlyCells={readOnlyCells} promptJobs={jobs} rowIds={rowIds}
            rowsReady={prompts.loaded} changeRow={(change) => prompts.changeRow(change, changes.length)}
            inputs={{ SALARY: salary, RETIREMENT: contribution, NYC_FIXED_CREDIT: salary <= 250_000 ? 125 : 0 }}
            update={(address, value, schedule) => prompts.edit("budget", address, value, schedule, {
              revision: changes.length, storageCell: address[0] + rowIds[Number(address.slice(1)) - 1],
            })} />
        </section>
      </div>
      {prompts.toast && <div className="prompt-toast" role={prompts.toast.error ? "alert" : "status"}>
        {prompts.toast.text}
      </div>}
    </main>
  );
}
