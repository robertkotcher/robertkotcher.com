"use client";

import { useState } from "react";

type AppSlide = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: string;
  iconAlt?: string;
  image: string;
  imageAlt: string;
  link?: string;
};

type AppCarouselProps = {
  slides: AppSlide[];
};

export function AppCarousel({ slides }: AppCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleSlides = slides.length > 1;

  function move(direction: -1 | 1) {
    if (!hasMultipleSlides) {
      return;
    }

    setActiveIndex((current) => {
      const next = current + direction;

      if (next < 0) {
        return slides.length - 1;
      }

      if (next >= slides.length) {
        return 0;
      }

      return next;
    });
  }

  return (
    <div className="landing-carousel">
      <div className="landing-carousel-copy">
        <p className="eyebrow">Selected apps</p>
        <h2 id="apps-title">Portfolio Samples</h2>
      </div>

      <div className="landing-carousel-stage">
        <div className="landing-carousel-viewport" aria-live="polite">
          {slides.map((slide, index) => (
            <article
              className="landing-carousel-slide"
              data-active={index === activeIndex}
              key={slide.title}
            >
              <div className="landing-carousel-media">
                <img src={slide.image} alt={slide.imageAlt} />
              </div>
              <div className="landing-carousel-detail">
                <div className="landing-carousel-product">
                  <div className="landing-carousel-title">
                    {slide.icon ? (
                      <img src={slide.icon} alt={slide.iconAlt ?? ""} />
                    ) : null}
                    <h3>{slide.title}</h3>
                  </div>
                  <span>{slide.description}</span>
                </div>
                {slide.link ? (
                  <a href={slide.link} target="_blank" rel="noreferrer">
                    Visit site
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className="landing-carousel-controls" aria-label="App examples">
          <button
            aria-label="Previous app"
            disabled={!hasMultipleSlides}
            onClick={() => move(-1)}
            type="button"
          >
            {"<"}
          </button>
          <div className="landing-carousel-dots" aria-label="Choose app">
            {slides.map((slide, index) => (
              <button
                aria-current={index === activeIndex}
                aria-label={`Show ${slide.title}`}
                disabled={!hasMultipleSlides}
                key={slide.title}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label="Next app"
            disabled={!hasMultipleSlides}
            onClick={() => move(1)}
            type="button"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
