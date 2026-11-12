import type { Metadata } from "next";
import { headers } from "next/headers";
import { budgetAuthorized } from "./budget-auth";
import BudgetSheet from "./BudgetSheet";
import { defaultPlan, type RetirementPlan } from "./retirement";
import "./budget.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Budget",
  alternates: { canonical: "/nyc-budget" },
};

function initialPlan(): RetirementPlan {
  const input = process.env.NYC_BUDGET_PLAN;
  if (!input) return defaultPlan;

  try {
    const values = JSON.parse(input);
    const plan = { ...defaultPlan };
    for (const key of Object.keys(plan) as (keyof RetirementPlan)[]) {
      if (typeof values?.[key] === "number" && Number.isFinite(values[key]) && values[key] >= 0) {
        plan[key] = values[key];
      }
    }
    return plan;
  } catch {
    return defaultPlan;
  }
}

export default async function BudgetPage() {
  if (process.env.VERCEL_ENV === "production" && !budgetAuthorized(await headers())) return null;
  return <BudgetSheet initialPlan={initialPlan()} />;
}
