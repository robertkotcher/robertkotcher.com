import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { budgetAuthorized, budgetLink } from "./budget-auth";
import BudgetSheet from "./BudgetSheet";
import { defaultPlan, type RetirementPlan } from "./retirement";
import "./budget.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Budget",
  robots: { index: false, follow: false },
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
  const production = process.env.VERCEL_ENV === "production";
  if (production && !budgetAuthorized(await headers())) notFound();
  const endpoint = production ? `${budgetLink()}/prompts` : "/api/nyc-budget/prompts";
  return <BudgetSheet initialPlan={initialPlan()} endpoint={endpoint} />;
}
