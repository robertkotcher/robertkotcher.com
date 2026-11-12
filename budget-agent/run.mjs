import { spawn } from "node:child_process";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

loadEnvFile(fileURLToPath(new URL("../.env.development.local", import.meta.url)));
const port = new URL(process.env.NYC_BUDGET_EVE_URL ?? "http://127.0.0.1:2034").port;
const child = spawn(process.execPath, ["node_modules/eve/bin/eve.js", "dev", "--host", "127.0.0.1",
  "--port", port, "--no-ui", "--no-default-extensions"], { stdio: "inherit" });

const timer = setInterval(() => {
  fetch(`http://127.0.0.1:${port}/eve/v1/dev/schedules/dispatch`, {
    method: "POST", signal: AbortSignal.timeout(310_000),
  }).catch(() => {});
}, 60_000);
child.on("exit", (code) => {
  clearInterval(timer);
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
