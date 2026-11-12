export const scenarios = [
  { name: "Low", stocks: 0.03, cash: 0.01, bonds: 0.03, color: "#5f6368" },
  { name: "Middle", stocks: 0.06, cash: 0.03, bonds: 0.04, color: "#1a73e8" },
  { name: "High", stocks: 0.09, cash: 0.04, bonds: 0.05, color: "#8430ce" },
];

export const inflation = 0.025;

export const defaultPlan = {
  cash: 0,
  stocks: 0,
  bonds: 0,
  payroll: 0,
  surplus: 0,
  month3: 0,
  month9: 0,
  spending: 0,
};

export type RetirementPlan = typeof defaultPlan;

export function project(plan: RetirementPlan, scenario: (typeof scenarios)[number]) {
  let { stocks, cash, bonds } = plan;
  const balances = [stocks + cash + bonds];
  const stockGrowth = (1 + scenario.stocks) ** (1 / 12);
  const cashGrowth = (1 + scenario.cash) ** (1 / 12);
  const bondGrowth = (1 + scenario.bonds) ** (1 / 12);

  for (let month = 1; month <= 360; month++) {
    stocks = stocks * stockGrowth + plan.payroll * 0.85;
    bonds = bonds * bondGrowth + plan.payroll * 0.15;
    cash = cash * cashGrowth + plan.surplus;

    const purchase = month === 3 ? plan.month3 : month === 9 ? plan.month9 : 0;
    const fundedPurchase = Math.min(cash, purchase);
    cash -= fundedPurchase;
    stocks += fundedPurchase;

    if (month % 12 === 0) {
      const total = stocks + cash + bonds;
      const target = Math.min(total * 0.70, Math.max(total * 0.55, stocks));
      const transfer = Math.min(cash, target - stocks);
      stocks += transfer;
      cash -= transfer;
      balances.push(stocks + cash + bonds);
    }
  }

  return balances;
}
