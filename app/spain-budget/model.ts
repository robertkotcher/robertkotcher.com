import type { SheetCells } from "../nyc-budget/formulas";

export const taxRowCount = 40;
export const expenseHeaderRow = 42;
export const rowCount = 62;
export const totals = new Set([31, 33, 35, 37, 40, 52, 54, 55, 57]);
export const rateRows = new Set([3, 36]);
export const euroRows = new Set([5, 9, 10, 11, 12, 13, ...Array.from({ length: 19 }, (_, i) => i + 14)]);
export const cells: SheetCells = {};
function row(index: number, label: string, value: string, note = "") {
  cells[`A${index}`] = label;
  cells[`B${index}`] = value;
  cells[`C${index}`] = note;
}
row(1, "Valencia · Income and taxes · 2026", "Amount", "José’s standard W-2 model. USD unless marked EUR.");
row(2, "Gross annual income", "=SALARY");
row(3, "EUR per USD", "0.87", "José’s fixed source exchange rate. Editable.");
row(4, "Gross monthly income", "=B2/12");
row(5, "Gross annual income · EUR", "=B2*B3");
row(6, "Social security / payroll costs (assumed)", "13500", "Annual USD input from José. Separate cash cost and deduction.");
row(7, "U.S. income tax (assumed)", "24000", "Annual USD input, federal + state combined. Assumed, not calculated.");
row(8, "Other U.S. insurance deductions", "0", "Annual USD. Healthcare is already included in expenses.");
row(9, "Social / payroll deduction · EUR", "=B6*B3");
row(10, "Employment deduction · EUR", "2000", "Source high-income deduction; slider stays above the low-income range.");
row(11, "Income subject to brackets · EUR", "=MAX(0,B5-B9-B10)");
row(12, "Family allowance · EUR", "17917.5", "Source assumes 2 children, 1 under 3, spouse without income.");
row(13, "Allowance tax value · EUR", "=B12*0.185", "Subtract its tax value once; do not also deduct the full allowance from income.");
const starts = [0,12000,12450,20200,22000,32000,35200,42000,52000,60000,62000,72000,100000,150000,200000,300000];
const rates = [.185,.215,.24,.27,.30,.325,.36,.385,.41,.45,.475,.49,.50,.51,.52,.54];
starts.forEach((start, i) => {
  const end = starts[i + 1];
  row(14 + i, `IRPF ${rates[i] * 100}% · EUR`,
    end ? `=MAX(0,MIN(B11,${end})-${start})*${rates[i]}` : `=MAX(0,B11-${start})*${rates[i]}`,
    `José’s combined general scale: €${start.toLocaleString("en-US")} ${end ? "to €" + end.toLocaleString("en-US") : "and above"}.`);
});
row(30, "Income tax before allowance · EUR", "=SUM(B14:B29)");
row(31, "Spain tax before U.S. credit · EUR", "=MAX(0,B30-B13)", "Combined IRPF after allowance.");
row(32, "Credit for assumed U.S. income tax · EUR", "=MIN(B31,MAX(0,B7*B3))", "Simplified source credit, capped at Spain tax. No refund.");
row(33, "Spain income tax after credit · USD", "=(B31-B32)/B3");
row(34, "U.S. income tax · monthly USD", "=B7/12");
row(35, "Total annual income tax · USD", "=B7+B33", "U.S. assumed tax + Spain tax after credit, counted once.");
row(36, "Effective income tax rate", "=B35/B2", "Annual income taxes / annual gross salary, expressed as a decimal.");
row(37, "Net annual income · USD", "=B2-B6-B8-B35");
row(38, "Spain income tax · monthly USD", "=B33/12");
row(39, "Social / payroll costs · monthly USD", "=B6/12");
row(40, "Net monthly take-home · USD", "=B37/12");
row(42, "Expenses", "Monthly USD", "Notes");
const expenses = [["Rent",3000],["Daycare",1500],["Groceries",1200],["Utilities",300],["Restaurants",500],["Healthcare",200],["Kids clothing",500],["Travel",600],["Household / miscellaneous",400]] as const;
expenses.forEach(([label, amount], i) => row(43 + i,label,String(amount),label === "Travel" ? "Annual travel amortized monthly." : ""));
row(52,"Total monthly expenses","=SUM(B43:B51)");
row(53,"Retirement contributions","0","Monthly USD.");
row(54,"Remaining monthly savings","=B40-B52-B53");
row(55,"Remaining annual savings","=B54*12");
row(57,"Spain tax installments · timing only","","60% June 30, 2027 and 40% November 5, 2027. Already included above.");
row(58,"June installment · USD","=B33*0.6");
row(59,"November installment · USD","=B33*0.4");
row(61,"Source and scope","","José’s “Tax Numbers Robert Kotcher W2 - Valencia”, Standard taxation, 2026. Simplified planning model; credits, allowance and payroll costs remain assumptions. No autónomo calculation.");
