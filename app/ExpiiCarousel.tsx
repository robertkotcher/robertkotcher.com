"use client";

import Image from "next/image";
import { useState } from "react";

const slides = [
  { src: "/expii/home.png", label: "Homepage" },
  { src: "/expii/algebra.png", label: "Algebra lesson browser" },
  { src: "/expii/solve.png", label: "Interactive math puzzles" },
];

export default function ExpiiCarousel() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  function move(direction: number) {
    setIndex((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="expii-carousel" aria-label="Expii screenshots" aria-roledescription="carousel">
      <a href={slide.src} target="_blank" rel="noreferrer" aria-label={`View full-size Expii ${slide.label.toLowerCase()} screenshot`}>
        <Image src={slide.src} alt={`Expii ${slide.label.toLowerCase()}`} width={1440} height={1000} sizes="(max-width: 760px) 100vw, 663px" />
      </a>
      <div className="carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous Expii screenshot">←</button>
        <p aria-live="polite" aria-atomic="true">{slide.label} <span>{index + 1} / {slides.length}</span></p>
        <button type="button" onClick={() => move(1)} aria-label="Next Expii screenshot">→</button>
      </div>
    </section>
  );
}
