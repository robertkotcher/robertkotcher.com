import Link from "next/link";
import { resumePdfUrl } from "../resumePdf";

export default function PrintControls({ backUrl = "/", pdfUrl = resumePdfUrl }: { backUrl?: string; pdfUrl?: string }) {
  return <nav className="print-controls" aria-label="Résumé options"><Link href={backUrl}>Back to résumé</Link><a href={pdfUrl} target="_blank" rel="noreferrer">Open PDF</a></nav>;
}
