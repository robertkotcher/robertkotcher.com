import Image from "next/image";
import { resumePdfUrl } from "./resumePdf";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import {
  ArrowUpRight,
  Mail,
  Phone,
  FileDown,
} from "lucide-react";
import ResumeFocus from "./ResumeFocus";

const projectUrl = "https://photos.app.goo.gl/2DL7bfRMNnXi1g3d8";

const technologyExperience = [
  { category: "Frontend", skills: [{ technology: "React.js / CSS", years: 10 }, { technology: "TypeScript", years: 8 }], additional: "HTML5" },
  { category: "Backend", skills: [{ technology: "Python / Node.js", years: 10 }, { technology: "Java", years: 6 }], additional: "Microservices" },
  { category: "Infrastructure", skills: [{ technology: "AWS", years: 8 }, { technology: "Docker", years: 7 }, { technology: "Kubernetes", years: 3 }] },
  { category: "Machine learning", skills: [{ technology: "Deep learning", years: 6 }] },
];

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
  return <span className="experience-tags" aria-label="Experience areas">{categories.split(" ").map(category => <span key={category}>#{category}</span>)}</span>;
}


export default function Resume({ printable = false }: { printable?: boolean }) {
  const pdfUrl = resumePdfUrl;
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
              <span>Y Combinator alumni</span><span>Carnegie Mellon graduate</span><span>viral app founder</span><span>2 exits</span>
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
            {!printable && <a href={pdfUrl} target="_blank" rel="noreferrer" aria-label="Open résumé PDF in a new tab" title="Open PDF"><FileDown aria-hidden="true" size={24} strokeWidth={1.8} /></a>}
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
                <div>
                <h3>
                  <a
                    className="sidebar-link project-title-link"
                    href={projectUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Cat-astrophe prevention unit</span>
                    {!printable && <ArrowUpRight aria-hidden="true" size={14} />}
                  </a>
                </h3>
                <p>
                  I built a robot to spray my cat when he gets on the counter.
                </p>

                </div>
              </div>
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
                    <span><span className="research-title">{publication.title}{!printable && <> <ArrowUpRight aria-hidden="true" size={14} /></>}</span><small>{publication.citations}</small></span>
                  </a>
                ))}
              </div>
            </section>
            <section className="technology-experience" data-background="engineering" aria-labelledby="technology-experience-title">
              <h2 id="technology-experience-title">Experience</h2>
              <div className="technology-experience-groups">
                {technologyExperience.map(({ category, skills, additional }) => (
                  <div className="technology-experience-group" key={category}>
                    <h3>{category}{additional && <span className="technology-group-extra"> · {additional}</span>}</h3>
                    <ul className="technology-experience-list">
                      {skills.map(({ technology, years }) => (
                        <li key={technology}>
                          <div className="technology-experience-label"><span>{technology}</span><span>{years} years</span></div>
                          <div className="technology-experience-track" aria-hidden="true"><div style={{ width: `${years / 10 * 100}%` }} /></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            {printable && <section className="print-contact-section">
              <h2>Contact</h2>
              <address className="print-contact-links">
                <a href="mailto:rkotcher@gmail.com" aria-label="Email: rkotcher@gmail.com" title="rkotcher@gmail.com"><Mail size={14} aria-hidden="true" /><span>rkotcher@gmail.com</span></a>
                <a href="tel:+12152923536" aria-label="Phone: +1 215 292 3536" title="+1 215 292 3536"><Phone size={14} aria-hidden="true" /><span>+1 215 292 3536</span></a>
                <a href="https://github.com/robertkotcher" aria-label="Robert Kotcher on GitHub" title="GitHub"><FaGithub size={14} aria-hidden="true" /><span>github.com/robertkotcher</span></a>
                <a href="https://www.linkedin.com/in/robert-kotcher-639105196" aria-label="Robert Kotcher on LinkedIn" title="LinkedIn"><FaLinkedinIn size={14} aria-hidden="true" /><span>linkedin.com/in/robert-kotcher-639105196</span></a>
              </address>
            </section>}
          </aside>

          <section className="experience" aria-labelledby="experience-title">
            <h2 id="experience-title">Professional experience</h2>

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
                Technical skills required included Three.js, Node.js, shadow mapping, geometry
                reduction, scene culling, frustum streaming, and character rigging.
              </p>

              <ExperienceTags categories="Three.js Node.js 3DGraphics PerformanceOptimization CharacterRigging" />

            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering product growth">
                <h3>
                  Founding engineer, pod lead @{" "}
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

              <ExperienceTags categories="TypeScript RubyOnRails PostgreSQL ABTesting TechnicalLeadership" />

            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering product">
                <h3>Product R&amp;D @ Codecov</h3>
                <p>(2020 – 2022)</p>
              </div>
              <p data-background="engineering product">
                Codecov was acquired by Sentry in 2022. I researched and built
                new products in JavaScript and Jest that were later handed off to the engineering team.
                My testing tool was one of the reasons for the acquisition.
              </p>

              <ExperienceTags categories="JavaScript Jest ProductResearch TestAutomation" />

            </div>
            <div className="role">
              <div className="role-heading" data-background="engineering">
                <h3>Lead Software Engineer @ Synthesis AI</h3>
                <p>(2020 – 2023)</p>
              </div>              <p data-background="engineering">
                As a founding engineer, I built most of Synthesis AI’s data pipelines from the ground up using Go (Golang) and Kubernetes. I maintained AWS infrastructure, Docker containers, and a Go API.
              </p>

              <ExperienceTags categories="Go Kubernetes Docker AWS DataPipelines" />

            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering">
                <h3>Software Engineer @ <a href="https://www.expii.com" target="_blank" rel="noreferrer">expii.com</a></h3>
                <p>(2015 – 2017)</p>
              </div>              <p data-background="engineering">Built Expii’s responsive learning-content editor in React.js, CSS, and Flexbox, supporting image, diagram, multiple-choice, text, and video blocks with pixel-perfect implementation of professional designs. The platform used a Python/Flask backend on AWS.</p>

              <ExperienceTags categories="React CSS Flexbox Flask ResponsiveDesign" />

            </div>

            <div className="role">
              <div className="role-heading" data-background="engineering">
                <h3>Software Engineer @ NASA</h3>
                <p>(2013 – 2015)</p>
              </div>              <p data-background="engineering">
                I developed Java software for an ADS-B sense-and-avoid system that
                was licensed to Vigilant Aerospace.
              </p>

              <ExperienceTags categories="Java ADSB CollisionAvoidance" />

            </div>
            <div className="role role-last">
              <div className="role-heading" data-background="engineering">
                <h3>Full Stack Engineer @ Tunessence</h3>
                <p>(April 2012 – June 2014)</p>
              </div>              <p data-background="engineering">I was the first hire at Tunessence, a guitar-teaching startup acquired by music publisher Hal Leonard. I worked across the stack using Python and JavaScript.</p>

              <ExperienceTags categories="Python JavaScript FullStackDevelopment" />

            </div>
          </section>
        </div>
        </Content>
      </article>
    </main>
  );
}
