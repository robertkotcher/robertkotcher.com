import Link from "next/link";
import Resume from "../../Resume";
export const metadata = { title: "Full-Stack Product Engineering | Robert Kotcher" };
export default function FullStackProductResume() {
  return <><nav className="print-controls"><Link href="/directory">Résumé directory</Link><small>Used for: Clear Street — Senior / Staff Software Engineer, Full-Stack Product</small></nav><Resume variant="full-stack-product-engineering" /></>;
}
