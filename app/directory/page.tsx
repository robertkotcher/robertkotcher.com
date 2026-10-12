import Link from "next/link";
export const metadata = { title: "Résumé directory | Robert Kotcher" };
export default function Directory() {
  return <main className="resume-directory"><h1>Résumé directory</h1><p><Link href="/">Global résumé</Link></p><article><h2><Link href="/directory/full-stack-product-engineering">Full-Stack Product Engineering</Link></h2><p>Frontend craftsmanship, complex interactive interfaces, full-stack ownership, and measurable product impact.</p><small>Used for: Clear Street — Senior / Staff Software Engineer, Full-Stack Product</small></article></main>;
}
