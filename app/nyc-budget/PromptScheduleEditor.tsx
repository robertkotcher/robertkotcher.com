"use client";

import { useId, useState } from "react";
import { AlarmClock } from "lucide-react";
import type { PromptJob } from "./prompt-formula";

import { weekdays, type ScheduleSettings } from "./prompt-schedule";

type Schedule = NonNullable<PromptJob["schedule"]>;

export default function PromptScheduleEditor({ cell, schedule, researchPrompt, loading, update }: {
  cell: string;
  schedule: Schedule | null;
  researchPrompt: string;
  loading: boolean;
  update: (cell: string, formula: string, schedule: ScheduleSettings | null) => void;
}) {
  const [cadence, setCadence] = useState<Schedule["cadence"] | "once">(schedule?.cadence ?? "once");
  const [minute, hour, day, , weekday] = (schedule?.cron ?? "00 09 * * *").split(" ");
  const time = [hour, minute].map((part) => part.padStart(2, "0")).join(":");
  const editorId = useId();

  return (
    <div className="prompt-schedule" onDoubleClick={(event) => event.stopPropagation()}>
      <button type="button" className="prompt-schedule-button" popoverTarget={editorId}
        aria-label={`Edit schedule for ${cell}${loading ? " (waiting for prompt results)" : ""}`} title="Edit schedule">
        <AlarmClock size={13} aria-hidden="true" />
        <span>{schedule?.cadence ?? "Run Once"}</span>
        {loading && <span className="prompt-spinner" aria-hidden="true" />}
      </button>
      <form id={editorId} className="budget-setting-popover prompt-schedule-editor" popover="auto"
        onToggle={(event) => {
          if (event.newState === "closed") {
            event.currentTarget.reset();
            setCadence(schedule?.cadence ?? "once");
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          const settings = cadence === "once" ? null : {
            cadence,
            time: String(fields.get("time")),
            timezone: String(fields.get("timezone")).trim(),
            day: fields.get("day")?.toString(),
          };
          update(cell, `PROMPT(${JSON.stringify(researchPrompt)})`, settings);
          event.currentTarget.hidePopover();
        }}>
        <label>Repeat
          <select className="dui-select dui-select-sm" value={cadence} autoFocus
            onChange={(event) => setCadence(event.currentTarget.value as typeof cadence)}>
            <option value="once">Run once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        {cadence === "weekly" && <label>Weekday
          <select className="dui-select dui-select-sm" name="day" defaultValue={weekday === "*" ? "MON" : weekday}>
            {Object.entries(weekdays).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>}
        {cadence === "monthly" && <label>Day of month
          <input className="dui-input dui-input-sm" type="number" name="day" min={1} max={31} required
            defaultValue={day === "*" ? 1 : day} />
        </label>}
        {cadence !== "once" && <>
          <label>Time
            <input className="dui-input dui-input-sm" type="time" name="time" required defaultValue={time} />
          </label>
          <label>Time zone
            <input className="dui-input dui-input-sm" name="timezone" required defaultValue={schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone} />
          </label>
        </>}
        <button className="dui-btn dui-btn-sm" type="submit">Save and run now</button>
      </form>
    </div>
  );
}
