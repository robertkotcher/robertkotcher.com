import type { Metadata } from "next";
import { AppScreens } from "../components/AppScreens";
import { appExamples } from "../components/appExamples";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Examples - robertkotcher.com",
  description:
    "Example apps and product work from Robert Kotcher, including legal-tech, consumer mobile, synthetic data, and board-game community software.",
};

export default function ExamplesPage() {
  return (
    <main className="cv-page examples-page">
      <SiteHeader />

      <section className="examples-hero" aria-labelledby="examples-title">
        <p className="eyebrow">Examples</p>
        <h1 id="examples-title">Apps and products I&apos;ve helped build.</h1>
        <p className="summary">
          A few examples of shipped work across consumer apps, workflow systems,
          legal technology, synthetic-data infrastructure, and community tools.
        </p>
      </section>

      <section className="apps-section examples-list" aria-label="Example apps">
        <div className="app-showcase-list">
          {appExamples.map((item) => (
            <article className="app-showcase" key={item.title}>
              <div className="app-showcase-copy">
                <div className="work-title-row">
                  <img src={item.iconSrc} alt={item.iconAlt} />
                  <div>
                    <p>{item.meta}</p>
                    <h3>{item.title}</h3>
                  </div>
                </div>
                <p>{item.copy}</p>
              </div>
              <AppScreens
                layout={item.layout}
                screens={item.screens}
                title={item.title}
              />
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
