import Link from "next/link";

export default function PrintControls() {
  return <nav className="print-controls" aria-label="Résumé options"><Link href="/">Back to résumé</Link><a href="/robert-kotcher-resume.pdf" target="_blank" rel="noreferrer">Open PDF</a></nav>;
}
