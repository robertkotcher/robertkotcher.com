import {
  ArrowUpRight,
  GitFork,
  Mail,
  Phone,
} from "lucide-react";

const projectUrl = "https://photos.app.goo.gl/2DL7bfRMNnXi1g3d8";

const research = [
  {
    title: "Timing attacks using CSS filters",
    citations: "51 citations",
    href: "https://www.researchgate.net/publication/262292364_Cross-origin_pixel_stealing_Timing_attacks_using_CSS_filters",
  },
  {
    title: "OAuth Demystified for Mobile Application developers",
    citations: "180 citations",
    href: "https://www.researchgate.net/publication/266022550_OAuth_Demystified_for_Mobile_Application_Developers",
  },
] as const;

export default function Home() {
  return (
    <main className="resume-shell">
      <article className="resume" aria-label="Robert Kotcher résumé">
        <header className="resume-header">
          <div className="identity">
            <h1>Robert Kotcher</h1>
            <p>Serial founding engineer</p>
          </div>

          <div className="summary">
            <p>
              Founding software engineer with a proven track record looking to
              join a team that is data-driven, prioritizes good communication,
              and operates with empathy.
            </p>
          </div>

          <address className="contact-bar">
            <a href="tel:+12152923536" aria-label="Call Robert Kotcher">
              <Phone aria-hidden="true" size={15} strokeWidth={1.8} />
              <span>+1 215 292 3536</span>
            </a>
            <a href="mailto:rkotcher@gmail.com">
              <Mail aria-hidden="true" size={15} strokeWidth={1.8} />
              <span>rkotcher@gmail.com</span>
            </a>
            <a
              href="https://www.linkedin.com/in/robert-kotcher-639105196"
              target="_blank"
              rel="noreferrer"
            >
              <span className="linkedin-mark" aria-hidden="true">
                in
              </span>
              <span>linkedin.com/in/robert-kotcher-639105196</span>
              <ArrowUpRight
                aria-hidden="true"
                className="external-icon"
                size={13}
              />
            </a>
            <a
              href="https://github.com/robertkotcher"
              target="_blank"
              rel="noreferrer"
            >
              <GitFork aria-hidden="true" size={15} strokeWidth={1.8} />
              <span>github.com/robertkotcher</span>
              <ArrowUpRight
                aria-hidden="true"
                className="external-icon"
                size={13}
              />
            </a>
          </address>
        </header>

        <div className="resume-body">
          <aside className="sidebar">
            <section>
              <h2>Education</h2>

              <div className="compact-item">
                <h3>Carnegie Mellon University ‘12</h3>
                <p>BXA Computer Science, Arts</p>
              </div>

              <div className="compact-item">
                <h3>AlphaLab Accelerator ‘12</h3>
                <p>with Tunessence (acquired)</p>
              </div>
            </section>

            <section>
              <h2>Projects</h2>

              <div className="compact-item">
                <h3>
                  <a
                    className="sidebar-link project-title-link"
                    href={projectUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Cat-astrophe prevention unit</span>
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </a>
                </h3>
                <p>
                  I built a robot to spray my cat when he gets on the counter.
                </p>
              </div>
            </section>

            <section>
              <h2>Research</h2>

              <div className="research-list">
                {research.map((publication) => (
                  <a
                    className="sidebar-link research-item"
                    href={publication.href}
                    key={publication.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{publication.title}</span>
                    <small>{publication.citations}</small>
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </a>
                ))}
              </div>
            </section>
          </aside>

          <section className="experience" aria-labelledby="experience-title">
            <h2 id="experience-title">Recent professional experience</h2>

            <div className="role">
              <div className="role-heading">
                <h3>
                  Founder @{" "}
                  <a
                    href="https://inflightsimulator.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    inflightsimulator.com
                  </a>
                </h3>
                <p>August 2026 – Present</p>
              </div>

              <p>
                Inflight Simulator lets people explore the world as an airline
                passenger, choosing destinations and collecting country flags
                as they complete virtual flights.
              </p>
              <p>
                Inflight Simulator went viral, with 30,000 flights created and
                1.6K backlinks earned in its first week.
              </p>
            </div>

            <div className="role">
              <div className="role-heading">
                <h3>
                  Founding engineer @{" "}
                  <a
                    href="https://solosuit.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    solosuit.com
                  </a>
                </h3>
                <p>August 2024 – Present</p>
              </div>

              <p>SoloSuit helps Americans navigate debt lawsuits.</p>
              <p>
                I contributed to SoloSuit’s debt resolution platform, helping
                200,000+ Americans navigate debt lawsuits and protecting $2.7
                billion in claimed debt.
              </p>
              <p>
                I increased the monthly settlement volume on SoloSettle by 20x
                over 20 months by leading dozens of A/B tests across the
                settlement funnel. I shipped a key experiment that increased
                sent settlement offers from 8% to 37%.
              </p>
              <p>
                I built and maintained core product features across a
                TypeScript, Ruby on Rails, and PostgreSQL stack, supporting a
                12,000+ spec test suite.
              </p>
            </div>

            <div className="role role-last">
              <div className="role-heading">
                <h3>Product R&amp;D @ Codecov</h3>
                <p>2020 – 2022</p>
              </div>

              <p>
                Codecov was acquired by Sentry in 2022. I built MVPs that were
                later handed off to the engineering team.
              </p>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
