"use client";

import { useEffect, useState } from "react";

const storageKey = "rk-fit-banner-dismissed";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(storageKey) === "true") {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), 3800);

    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    window.localStorage.setItem(storageKey, "true");
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="promo-banner" aria-label="Introductory offer">
      <button
        aria-label="Dismiss introductory offer"
        className="promo-dismiss"
        onClick={dismiss}
        type="button"
      >
        ×
      </button>
      <p>Special offer</p>
      <h2>First two weeks are free.</h2>
      <span>Let&apos;s work together and make sure it&apos;s a good fit.</span>
      <a href="/contact">Start the conversation</a>
    </aside>
  );
}
