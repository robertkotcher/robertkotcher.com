import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

const links = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/cookies", label: "Cookie Notice" },
  { href: "/security", label: "Security" },
  { href: "/sitemap", label: "Sitemap" },
];

export default function SitemapPage() {
  return (
    <main className="cv-page legal-page">
      <SiteHeader />
      <section className="legal-content" aria-labelledby="sitemap-title">
        <p className="eyebrow">Robert Kotcher Web Studio</p>
        <h1 id="sitemap-title">Sitemap</h1>
        <p className="legal-updated">Useful pages on this site.</p>
        <ul className="sitemap-list">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
