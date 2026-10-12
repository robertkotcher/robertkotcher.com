"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PrintControls() {
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => { cancelled = true; };
  }, []);

  return <><p className="print-help">For a clean PDF, open More settings and uncheck Headers and footers in the print dialog.</p><nav className="print-controls" aria-label="Print options"><Link href="/">Back to résumé</Link><button onClick={() => window.print()}>Print / Save as PDF</button></nav></>;
}
