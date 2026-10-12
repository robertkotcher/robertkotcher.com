import Link from "next/link";
import { resumePdfUrl } from "../resumePdf";

export default function PrintControls() {
  return <nav className="print-controls" aria-label="Résumé options"><Link href="/">Back to résumé</Link><a href={resumePdfUrl} target="_blank" rel="noreferrer">Open PDF</a></nav>;
}
