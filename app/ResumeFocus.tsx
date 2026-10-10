"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

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
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previouslyHidden = Array.from(container.querySelectorAll<HTMLElement>("[data-focus-hidden]"));
    previouslyHidden.forEach((element) => element.removeAttribute("data-focus-hidden"));

    const tagged = Array.from(container.querySelectorAll<HTMLElement>("[data-background]"));
    const unrelated = (element: HTMLElement) => Boolean(focus && !element.dataset.background?.split(" ").includes(focus));
    const candidates = new Set(tagged.filter(unrelated));
    container.querySelectorAll<HTMLElement>(".role, .sidebar > section").forEach((section) => {
      const content = Array.from(section.querySelectorAll<HTMLElement>("[data-background]"));
      if (content.length && content.every(unrelated)) candidates.add(section);
    });
    const targets = Array.from(candidates).filter((element) => !Array.from(candidates).some((parent) => parent !== element && parent.contains(element)));
    const animations: Animation[] = [];

    function animate(element: HTMLElement, collapsing: boolean) {
      const style = getComputedStyle(element);
      const full = { height: `${element.getBoundingClientRect().height}px`, marginTop: style.marginTop, marginBottom: style.marginBottom, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, opacity: "1" };
      const empty = { height: "0px", marginTop: "0px", marginBottom: "0px", paddingTop: "0px", paddingBottom: "0px", opacity: "0" };
      element.style.overflow = "hidden";
      const animation = element.animate(collapsing ? [{ ...full, opacity: ".18" }, empty] : [empty, full], { duration: 420, delay: collapsing ? 260 : 0, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
      animations.push(animation);
      animation.onfinish = () => {
        if (collapsing) element.setAttribute("data-focus-hidden", "");
        element.style.removeProperty("overflow");
      };
    }

    targets.forEach((element) => {
      if (reducedMotion) element.setAttribute("data-focus-hidden", "");
      else animate(element, true);
    });
    if (!reducedMotion) previouslyHidden.filter((element) => !targets.some((target) => target === element || target.contains(element))).forEach((element) => animate(element, false));

    return () => {
      animations.forEach((animation) => animation.cancel());
      [...targets, ...previouslyHidden].forEach((element) => element.style.removeProperty("overflow"));
    };
  }, [focus]);

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
    <div ref={root} className="focus-view" data-focus={focus ?? undefined}>
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
