import { defineSchedule } from "eve/schedules";
import { dispatch } from "../../dispatch.mjs";

export default defineSchedule({
  cron: "* * * * *",
  run: ({ waitUntil }) => waitUntil(dispatch()),
});
