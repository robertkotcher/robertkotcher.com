"use client";

import { useState } from "react";

type Screen = {
  label: string;
  src?: string;
};

type AppScreensProps = {
  layout?: string;
  screens: Screen[];
  title: string;
};

function ScreenImage({ screen }: { screen: Screen }) {
  if (!screen.src) {
    return <span>{screen.label}</span>;
  }

  return <img src={screen.src} alt={screen.label} />;
}

export function AppScreens({ layout, screens, title }: AppScreensProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const allScreensHaveImages = screens.every((screen) => screen.src);

  if (layout === "desktop" && allScreensHaveImages) {
    const activeScreen = screens[activeIndex];

    return (
      <div className="app-carousel" aria-label={`${title} screenshots`}>
        <div className="app-carousel-frame">
          <img src={activeScreen.src} alt={activeScreen.label} />
        </div>
        <div className="app-carousel-controls">
          <button
            aria-label={`Previous ${title} screenshot`}
            onClick={() =>
              setActiveIndex((index) =>
                index === 0 ? screens.length - 1 : index - 1,
              )
            }
            type="button"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div className="app-carousel-dots" aria-label="Screenshot navigation">
            {screens.map((screen, index) => (
              <button
                aria-label={`Show ${screen.label}`}
                aria-current={activeIndex === index}
                key={screen.label}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label={`Next ${title} screenshot`}
            onClick={() =>
              setActiveIndex((index) =>
                index === screens.length - 1 ? 0 : index + 1,
              )
            }
            type="button"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    );
  }

  if (allScreensHaveImages) {
    return (
      <div
        className="app-screens app-screens-horizontal"
        aria-label={`${title} screenshots`}
      >
        {screens.map((screen) => (
          <div className="app-screen" key={screen.label}>
            <ScreenImage screen={screen} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app-screens" aria-label={`${title} screenshot placeholders`}>
      <div className="app-screen app-screen-large">
        <ScreenImage screen={screens[0]} />
      </div>
      <div>
        {screens.slice(1).map((screen) => (
          <div className="app-screen" key={screen.label}>
            <ScreenImage screen={screen} />
          </div>
        ))}
      </div>
    </div>
  );
}
