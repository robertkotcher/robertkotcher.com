# Local budget research worker

Use the existing Next.js development preview on loopback. Create a dedicated local
Postgres database and apply `schema.sql`. Set `NYC_BUDGET_DATABASE_URL` in the site's
gitignored `.env.development.local`. The default Eve URL is
`http://127.0.0.1:2034`; set `NYC_BUDGET_EVE_URL` to override its port.

From this directory, install with `npm ci --legacy-peer-deps` and start with
Node 24 using `npm start`. Supply AI Gateway credentials through the local
environment if needed. The worker binds Eve to loopback. The development launcher
invokes the authored Eve schedule every minute because Eve dev disables cron.
Saving a formula also invokes the schedule immediately to process due work.

For a database created before the tax and expense grids were merged, apply
`merge-budget-grid.sql` after `schema.sql`. It preserves saved prompt runs and
moves expense cells and their formula references down 11 rows. Then apply
`add-federal-tax-rows.sql` to insert the federal breakdown and the spacer row.
Then apply `split-federal-brackets.sql` to give the 10% and 12% brackets
their own rows, followed by `add-state-tax-rows.sql` for the New York and
New Jersey breakdown. These migrations are safe to rerun.

Enter `PROMPT("find grocery stores near Millburn")` to run once. Click the purple
alarm clock to set a daily, weekly, or monthly schedule. Saving the schedule
runs the prompt immediately.

Production uses the protected Next.js budget routes and the linked Postgres
database. Vercel Cron checks for due jobs every minute. Production prompt runs
use AI Gateway with web search, while the local preview uses the Eve worker.
