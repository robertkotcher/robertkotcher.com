"use client";

import { useEffect, useState } from "react";

const sources = [
  {
    label: "Clutch app development pricing guide (clutch.co)",
    href: "https://clutch.co/directory/mobile-application-developers/pricing",
  },
  {
    label: "DesignRush software development cost data (designrush.com)",
    href: "https://www.designrush.com/agency/software-development/trends/software-development-budget",
  },
  {
    label: "Naveck USA app development pricing guide (naveck.com)",
    href: "https://www.naveck.com/services/mobile-app-development/",
  },
];

export function CostContextModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className="cost-context-link"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Professional development gets expensive quickly.
      </button>

      {isOpen ? (
        <div className="cost-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div
            aria-labelledby="cost-modal-title"
            aria-modal="true"
            className="cost-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close pricing context"
              className="cost-modal-dismiss"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
            <p className="eyebrow">Cost context</p>
            <h2 id="cost-modal-title">Why custom apps add up</h2>
            <p>
              Custom app development often starts in the tens of thousands of
              dollars, with many firms billing $80-$200+ per hour for
              development and support.
            </p>
            <div className="cost-modal-sources">
              <span>Sources:</span>
              <ul>
                {sources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
