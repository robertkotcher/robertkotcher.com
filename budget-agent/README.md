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

Enter `PROMPT("find grocery stores near Millburn")` to run once. Click the purple
alarm clock to set a daily, weekly, or monthly schedule. Saving the schedule
runs the prompt immediately.
