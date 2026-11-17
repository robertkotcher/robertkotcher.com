import type { Metadata } from "next";
import BudgetSheet from "../nyc-budget/BudgetSheet";
import { defaultPlan } from "../nyc-budget/retirement";
import "../nyc-budget/budget.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Valencia cost of living",
  robots: { index: false, follow: false },
};
export default function SpainBudgetPage() {
  return <BudgetSheet initialPlan={{ ...defaultPlan, payroll: 0, surplus: 0 }} endpoint="/api/spain-budget/cells" variant="spain" />;
}
