import Image from "next/image";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import {
  ArrowUpRight,
  Mail,
  Phone,
  FileDown,
} from "lucide-react";
import ExpiiGallery from "./ExpiiGallery";
import ResumeFocus from "./ResumeFocus";

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

function ExperienceTags({ categories }: { categories: string }) {
  return <div className="experience-tags" aria-label="Experience areas">{categories.split(" ").map(category => <span key={category}>{category}</span>)}</div>;
}

function EngineeringSkills({ skills }: { skills: string[] }) {
  return <ul className="engineering-skills" aria-label="Engineering skills used">{skills.map(skill => <li key={skill}>{skill}</li>)}</ul>;
}

export default function Resume({ printable = false }: { printable?: boolean }) {
  const Content = printable ? "div" : ResumeFocus;
  return (
    <main className={`resume-shell${printable ? " printable-resume" : ""}`}>
      <article className="resume" aria-label="Robert Kotcher résumé">
        <header className="resume-header">
          <div className="header-person">
            <div className="header-portrait"><Image src="/robert-kotcher-portrait.png" alt="Robert Kotcher" width={998} height={1004} priority /></div>
          <div className="identity">
            <h1>Robert Kotcher</h1>
            <p className="identity-highlights">
              <span>YC alum</span><span>Carnegie Mellon alum</span><span>viral app founder</span><span>2 exits</span>
            </p>
          </div>
          </div>

          {!printable && <nav className="header-socials" aria-label="Social and contact links">
            <a href="https://github.com/robertkotcher" target="_blank" rel="noreferrer" aria-label="Robert Kotcher on GitHub" title="GitHub">
              <Image src="/github-icon.svg" alt="" width={24} height={24} />
            </a>
            <a href="https://www.linkedin.com/in/robert-kotcher-639105196" target="_blank" rel="noreferrer" aria-label="Robert Kotcher on LinkedIn" title="LinkedIn">
              <Image src="/linkedin-icon.svg" alt="" width={24} height={24} />
            </a>
            <a href="mailto:rkotcher@gmail.com" aria-label="Email Robert Kotcher" title="rkotcher@gmail.com">
              <Mail aria-hidden="true" size={24} strokeWidth={1.8} />
            </a>
            {!printable && <a href="/robert-kotcher-resume.pdf" target="_blank" rel="noreferrer" aria-label="Open résumé PDF in a new tab" title="Open PDF"><FileDown aria-hidden="true" size={24} strokeWidth={1.8} /></a>}
          </nav>}
        </header>


        <Content>
        <div className="resume-body">
          <aside className="sidebar">
            <section>
              <h2>Education</h2>

              <div className="compact-item" data-background="engineering product">
                <h3>Carnegie Mellon University ‘12</h3>
                <p>BXA Computer Science, Arts</p>
              </div>

              <div className="compact-item" data-background="product growth">
                <h3>AlphaLab Accelerator ‘12</h3>
                <p>with Tunessence (acquired)</p>
              </div>
            </section>

            <section>
              <h2>Projects</h2>

              <div className="compact-item" data-background="engineering">
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
              <ExperienceTags categories="engineering" />
            </section>

            <section>
              <h2>Research</h2>

              <div className="research-list">
                {research.map((publication) => (
                  <a
                    className="sidebar-link research-item"
                    data-background="engineering"
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
              <ExperienceTags categories="engineering" />
            </section>
            {printable && <section className="print-contact-section">
              <h2>Contact</h2>
              <address className="print-contact-links">
                <a href="mailto:rkotcher@gmail.com" aria-label="Email: rkotcher@gmail.com" title="rkotcher@gmail.com"><Mail size={22} aria-hidden="true" /></a>
                <a href="tel:+12152923536" aria-label="Phone: +1 215 292 3536" title="+1 215 292 3536"><Phone size={22} aria-hidden="true" /></a>
                <a href="https://github.com/robertkotcher" aria-label="Robert Kotcher on GitHub" title="GitHub"><FaGithub size={22} aria-hidden="true" /></a>
                <a href="https://www.linkedin.com/in/robert-kotcher-639105196" aria-label="Robert Kotcher on LinkedIn" title="LinkedIn"><FaLinkedinIn size={22} aria-hidden="true" /></a>
              </address>
            </section>}
          </aside>

          <section className="experience" aria-labelledby="experience-title">
            <h2 id="experience-title">Recent professional experience</h2>

            <div className="role">
              <div className="role-heading" data-background="engineering product growth">
                <h3>
                  Founder, engineer @{" "}
                  <a
                    href="https://inflightsimulator.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    inflightsimulator.com
                  </a>
                </h3>
                <p>(August 2026 – present)</p>
              </div>

              <p data-background="growth">
                Inflight Simulator went viral, reaching 60,000 flights within days
                of release.
              </p>
              <p data-background="product">
                Inflight Simulator lets people explore the world as an airline
                passenger, choosing destinations and collecting country flags
                as they complete virtual flights.
              </p>
              <p className="technical-skills" data-background="engineering">
                Technical skills required included shadow mapping, geometry
                reduction, scene culling, frustum streaming, and character rigging.
              </p>
              <ExperienceTags categories="engineering product growth" />
              {!printable && <EngineeringSkills skills={["Three.js", "character rigging", "Node.js"]} />}
            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering product growth">
                <h3>
                  Founding engineer, team lead @{" "}
                  <a
                    href="https://solosuit.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    solosuit.com
                  </a>
                </h3>
                <p>(2024 – present)</p>
              </div>

              <p data-background="engineering">
                As a founding engineer at SoloSuit (Y Combinator, W21), I helped
                build a debt resolution platform serving 200,000+ Americans and
                protecting $2.7 billion in claimed debt.
              </p>
              <p data-background="growth">
                I grew SoloSettle’s monthly settlement volume 20x in 20 months,
                leading dozens of A/B tests across the settlement funnel.
              </p>
              <p data-background="product">
                I shipped a product experiment that increased the settlement-offer
                send rate from 8% to 37%.
              </p>
              <p data-background="engineering">
                I lead a pod of 3–6 engineers and own the team’s delivery. I build
                and maintain core features in TypeScript, Ruby on Rails, and
                PostgreSQL, supporting a 12,000+ spec test suite.
              </p>
              <ExperienceTags categories="engineering product growth" />
              {!printable && <EngineeringSkills skills={["TypeScript", "Ruby on Rails", "Postgres"]} />}
            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering product">
                <h3>Product R&amp;D @ Codecov</h3>
                <p>(2020 – 2022)</p>
              </div>

              <p data-background="engineering product">
                Codecov was acquired by Sentry in 2022. I researched and built
                new products that were later handed off to the engineering team.
                My testing tool was one of the reasons for the acquisition.
              </p>
              <ExperienceTags categories="engineering product" />
              {!printable && <EngineeringSkills skills={["JavaScript", "Jest"]} />}
            </div>
            <div className="role">
              <div className="role-heading" data-background="engineering">
                <h3>Senior Software Engineer @ SynthesisAI</h3>
                <p>(2020 – 2023)</p>
              </div>
              <p data-background="engineering">
                SynthesisAI was building a synthetic data generation platform.
                I maintained a server farm on AWS, orchestrated with Kubernetes,
                with an API built in Go.
              </p>
              <ExperienceTags categories="engineering" />
              {!printable && <EngineeringSkills skills={["Kubernetes", "Docker", "Go", "AWS"]} />}
            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering">
                <h3>Software Engineer @ <a href="https://www.expii.com" target="_blank" rel="noreferrer">expii.com</a></h3>
                <p>(2015 – 2017)</p>
              </div>
              <p data-background="engineering">I worked on Expii’s interactive math and science learning platform, built with a React.js frontend and Flask backend.</p>
              <div data-background="engineering"><ExpiiGallery /></div>
              <ExperienceTags categories="engineering" />
              {!printable && <EngineeringSkills skills={["React", "Flask", "AWS"]} />}
            </div>

            <div className="role role-last">
              <div className="role-heading" data-background="engineering">
                <h3>Software Engineer @ NASA</h3>
                <p>(2013 – 2015)</p>
              </div>
              <p data-background="engineering">
                I developed software for an ADS-B sense-and-avoid system that
                was licensed to Vigilant Aerospace.
              </p>
              <ExperienceTags categories="engineering" />
              {!printable && <EngineeringSkills skills={["Java"]} />}
            </div>
          </section>
        </div>
        </Content>
      </article>
    </main>
  );
}
