import expenses from "./expenses.json";
import { type SheetCells, shiftRowReferences } from "./formulas";
import { annualTaxTotalRow, defaultTaxCells, taxRowCount } from "./taxes";

export const expenseHeaderRow = taxRowCount + 2;
const firstExpenseRow = expenseHeaderRow + 1;
const takeHomeRow = expenseHeaderRow + expenses.length + 12;
export const totalRow = takeHomeRow + 1;
export const budgetRowCount = totalRow + 8;
export const budgetTotals = new Set([annualTaxTotalRow, taxRowCount, takeHomeRow, totalRow, totalRow + 3]);

export const defaultBudgetCells: SheetCells = {
  ...defaultTaxCells,
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
  [`B${totalRow}`]: `=SUM(B${expenseHeaderRow}:B${takeHomeRow})-B${takeHomeRow}`,
  [`A${totalRow + 1}`]: "Available to save",
  [`B${totalRow + 1}`]: `=B${takeHomeRow}-B${totalRow}`,
  [`A${totalRow + 2}`]: "Planned retirement contributions",
  [`B${totalRow + 2}`]: "=RETIREMENT",
  [`A${totalRow + 3}`]: "Cash remaining after contributions",
  [`B${totalRow + 3}`]: `=B${totalRow + 1}-B${totalRow + 2}`,
};


export const budgetLayoutKey = "budget-row-layout";
export const maxBudgetRows = 500;

export type RowChange = { row: number; insert: boolean };

export function readRowChanges(value?: string): RowChange[] {
  return value ? JSON.parse(value) : [];
}

// Prompt cells and their runs use stable IDs while displayed row numbers shift.
export function budgetRowIds(changes: RowChange[]): number[] {
  const ids = Array.from({ length: budgetRowCount }, (_, index) => index + 1);
  changes.forEach(({ row, insert }, index) => {
    if (insert) ids.splice(row - 1, 0, budgetRowCount + index + 1);
    else ids.splice(row - 1, 1);
  });
  return ids;
}

export function budgetDefaults(changes: RowChange[]): SheetCells {
  return changes.reduce((cells, { row, insert }) => Object.fromEntries(
    Object.entries(cells).flatMap(([address, value]) => {
      const index = Number(address.slice(1));
      if (!insert && index === row) return [];
      const next = index + (insert ? Number(index >= row) : -Number(index > row));
      return [[address[0] + next, shiftRowReferences(value, row, insert)]];
    }),
  ), defaultBudgetCells);
}
