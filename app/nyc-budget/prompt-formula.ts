export function isPromptFormula(value: string) {
  return /^\s*=?\s*PROMPT\s*\(/i.test(value);
}

export function promptText(formula: string) {
  const match = formula.match(/^\s*=?\s*PROMPT\s*\(\s*("(?:[^"\\]|\\.)*")\s*\)\s*$/i);
  if (!match) throw new Error('Use PROMPT("your research request").');
  let prompt: string;
  try {
    prompt = JSON.parse(match[1]).trim();
  } catch {
    throw new Error('Use a double-quoted prompt and escape quotes inside it.');
  }
  if (!prompt || prompt.length > 2000) throw new Error("Enter a prompt between 1 and 2,000 characters.");
  return prompt;
}

export type PromptJob = {
  sheet: string;
  cell: string;
  formula: string;
  version: number;
  research_prompt: string;
  schedule: { cadence: "daily" | "weekly" | "monthly"; timezone: string; immediate: boolean; cron: string } | null;
  next_run_at: string | null;
  status: "queued" | "scheduled" | "running" | "complete" | "failed";
  result: string | null;
  error: string | null;
};
