"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const screenshots = [
  { src: "/expii/home.png", label: "Homepage" },
  { src: "/expii/algebra.png", label: "Algebra lesson browser" },
  { src: "/expii/solve.png", label: "Interactive math puzzles" },
];

export default function ExpiiGallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(screenshots[0]);

  return (
    <>
      <section className="expii-gallery" aria-label="Expii screenshots">
        {screenshots.map((screenshot) => (
          <button className="expii-card" type="button" key={screenshot.src}
            aria-label={`Expand Expii ${screenshot.label.toLowerCase()} screenshot`}
            onClick={() => { setSelected(screenshot); dialog.current?.showModal(); }}>
            <Image src={screenshot.src} alt={`Expii ${screenshot.label.toLowerCase()}`} width={1440} height={1000} sizes="(max-width: 760px) 30vw, 215px" />
            <span>{screenshot.label}</span>
          </button>
        ))}
      </section>
      <dialog ref={dialog} className="expii-lightbox" aria-labelledby="expii-lightbox-title"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="lightbox-header">
          <p id="expii-lightbox-title">Expii — {selected.label}</p>
          <button className="lightbox-close" type="button" aria-label="Close screenshot" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <Image src={selected.src} alt={`Expii ${selected.label.toLowerCase()}`} width={1440} height={1000} sizes="94vw" />
      </dialog>
    </>
  );
}
