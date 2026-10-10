"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const focuses = ["engineering", "product", "growth"] as const;
type Focus = (typeof focuses)[number];

function readFocus(): Focus | null {
  const value = new URLSearchParams(window.location.search).get("focus");
  return focuses.includes(value as Focus) ? (value as Focus) : null;
}

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("resume-focus", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("resume-focus", callback);
  };
}

export default function ResumeFocus({ children }: { children: ReactNode }) {
  const focus = useSyncExternalStore(subscribe, readFocus, () => null);

  function selectFocus(value: Focus | null) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("focus", value);
    else url.searchParams.delete("focus");
    if (url.href !== window.location.href) {
      window.history.pushState(null, "", url);
      window.dispatchEvent(new Event("resume-focus"));
    }
  }

  return (
    <div className="focus-view" data-focus={focus ?? undefined}>
      <section className="focus-controls" aria-label="Focus résumé by experience">
        <p>I&apos;m interested in Robert&apos;s experience in:</p>
        <div className="focus-pills">
          {focuses.map((value) => (
            <button key={value} type="button" className="focus-pill" aria-pressed={focus === value} onClick={() => selectFocus(value)}>{value}</button>
          ))}
          {focus ? <button type="button" className="focus-pill focus-clear" onClick={() => selectFocus(null)}>Clear ×</button> : null}
        </div>
      </section>
      {children}
    </div>
  );
}
