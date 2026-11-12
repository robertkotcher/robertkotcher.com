import { matchesSecret } from "../../../nyc-budget/budget-auth";
import { dispatchProductionPrompt } from "../../../nyc-budget/production-prompts";

export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !matchesSecret(request.headers.get("authorization"), `Bearer ${secret}`)) {
    return new Response(null, { status: 401 });
  }

  const status = await dispatchProductionPrompt();
  console.info("Budget cron:", status);
  return Response.json({ status }, { status: status === "failed" ? 502 : 200 });
}
