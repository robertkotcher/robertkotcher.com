export const weekdays = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday",
  FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};

export type ScheduleSettings = {
  cadence: "daily" | "weekly" | "monthly";
  time: string;
  timezone: string;
  day?: string;
};

export function buildPromptSchedule(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") throw new Error("Invalid schedule.");
  const { cadence, time, timezone, day } = value as Partial<ScheduleSettings>;
  if (cadence !== "daily" && cadence !== "weekly" && cadence !== "monthly") throw new Error("Choose a repeat interval.");
  if (typeof time !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("Choose a valid time.");
  if (typeof timezone !== "string" || !timezone) throw new Error("Enter a time zone.");
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error("Enter a valid time zone, such as America/New_York.");
  }
  if (cadence === "weekly" && (typeof day !== "string" || !Object.hasOwn(weekdays, day))) throw new Error("Choose a weekday.");
  if (cadence === "monthly" && (typeof day !== "string" || !/^(?:[1-9]|[12]\d|3[01])$/.test(day))) throw new Error("Choose a day from 1 to 31.");

  const [hour, minute] = time.split(":").map(Number);
  const cron = `${minute} ${hour} ${cadence === "monthly" ? day : "*"} * ${cadence === "weekly" ? day : "*"}`;
  return { cadence, timezone, cron, immediate: true };
}
