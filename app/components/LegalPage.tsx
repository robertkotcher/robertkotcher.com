import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type LegalPageProps = {
  title: string;
  updated: string;
  sections: Array<{
    body: string;
    heading: string;
  }>;
};

export function LegalPage({ sections, title, updated }: LegalPageProps) {
  return (
    <main className="cv-page legal-page">
      <SiteHeader />
      <section className="legal-content" aria-labelledby="legal-title">
        <p className="eyebrow">Robert Kotcher Web Studio</p>
        <h1 id="legal-title">{title}</h1>
        <p className="legal-updated">Last updated {updated}</p>
        {sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
