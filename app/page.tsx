import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

export default function Home() {
  const experience = [
    {
      role: "Founding Engineer",
      org: "SoloSuit",
      date: "2024-Present",
      iconSrc: "https://www.google.com/s2/favicons?domain=solosuit.com&sz=128",
      iconAlt: "SoloSuit logo",
      detail:
        "Founding engineer on a legal-tech platform helping Americans resolve debt lawsuits and settlement workflows.",
      highlights: [
        { value: "$2.7B", label: "debt protected" },
        { value: "200K", label: "lawsuits helped negotiate" },
        { value: "20x", label: "monthly settled-debt growth" },
        { value: "8% -> 37%", label: "increase in offers sent" },
      ],
      notes: [
        "Maintains a TypeScript, Rails, and Postgres system with 12,000+ RSpec tests.",
        "Company context: Inc. 5000 #633, 1,200+ monthly paying customers, backed by YC, Kleiner Perkins, The LegalTech Fund, Temerity, and others.",
      ],
    },
    {
      role: "Lead Software Engineer / Second Hire",
      org: "Synthesis AI",
      date: "2020-2023",
      iconSrc: "/synthesis-ai-icon.png",
      iconAlt: "Synthesis AI logo",
      detail:
        "Built core data pipelines and render-farm infrastructure for synthetic-data generation.",
      notes: [
        "Joined as one of the earliest engineers and built much of the pipeline foundation from the ground up.",
        "Worked primarily with Go, Kubernetes, and production data infrastructure.",
      ],
    },
    {
      role: "Product R&D",
      org: "Codecov",
      date: "2020-2022",
      iconSrc: "/codecov-icon.svg",
      iconAlt: "Codecov logo",
      detail:
        "Researched product directions around code testing, analysis, and engineering-quality signals.",
      notes: [
        "Worked before Codecov was acquired by Sentry.",
        "Focused on the overlap between developer behavior, testing workflows, and product strategy.",
      ],
    },
    {
      role: "Mobile App Engineer",
      org: "Moment",
      date: "2019-2020",
      iconSrc: "/moment-icon.png",
      iconAlt: "Moment app icon",
      detail:
        "Built consumer mobile product features for an app used by millions of people.",
      notes: [
        "Worked on a product with 8M users.",
        "Contributed to mobile engineering in a user-behavior and habit-change product domain.",
      ],
    },
    {
      role: "Software Engineer",
      org: "NASA / Expii",
      date: "2013-2017",
      iconSrc: "https://www.google.com/s2/favicons?domain=nasa.gov&sz=128",
      iconAlt: "NASA logo",
      detail:
        "Built software at NASA and later Expii, including published aerospace and education-technology work.",
      notes: [
        "Co-authored NASA-published research on ADS-B sense-and-avoid algorithms for UAS integration into national airspace.",
        "At Expii, worked on software for an education platform described as a GPS for learning.",
      ],
    },
  ];

  const selectedWork = [
    {
      title: "OAuth security research",
      meta: "ACM CCS / Black Hat USA",
      iconSrc: "https://www.google.com/s2/favicons?domain=blackhat.com&sz=128",
      iconAlt: "Black Hat icon",
      copy:
        "Co-authored highly-cited CMU web-security research that studied 600+ popular mobile apps and found 59.7% of OAuth implementations among sampled OAuth apps were vulnerable.",
    },
    {
      title: "Startup operator",
      meta: "6x co-founder",
      iconSrc:
        "https://www.google.com/s2/favicons?domain=indiehackers.com&sz=128",
      iconAlt: "Indie Hackers icon",
      copy:
        "Publicly describes himself as a Carnegie Mellon CS alum and 6x startup co-founder, with work spanning legal tech, music collaboration, AI, education, and developer tools.",
    },
    {
      title: "Applied ML and legal docs",
      meta: "Hugging Face",
      iconSrc:
        "https://www.google.com/s2/favicons?domain=huggingface.co&sz=128",
      iconAlt: "Hugging Face logo",
      copy:
        "Published a RoBERTa-based experiment exploring section extraction in legal documents with noisy PDF and HTML structure.",
    },
  ];

  const skills = [
    "Ruby on Rails",
    "TypeScript",
    "Postgres",
    "RSpec",
    "Go",
    "Kubernetes",
    "Python",
    "Playwright",
    "Flask",
    "Next.js",
    "Cursor",
    "Codex",
    "Claude Code",
    "Devin",
  ];

  return (
    <main className="cv-page">
      <SiteHeader />
      <section className="hero" aria-label="Robert Kotcher CV">
        <div className="hero-copy">
          <h1>Robert Kotcher</h1>
          <p className="summary">
            Product-minded software engineer with a track record of shipping
            measurable systems: legal-tech settlement growth, synthetic-data
            infrastructure, developer-tool research, mobile apps at scale, and
            highly-cited security research from Carnegie Mellon.
          </p>
        </div>
        <div className="portrait-wrap">
          <img
            src="/robert-kotcher.png"
            alt="Robert Kotcher"
            className="portrait"
          />
        </div>
      </section>

      <div className="content-grid">
        <section className="main-column" aria-labelledby="experience-title">
          <div className="section-heading">
            <p>Experience</p>
            <h2 id="experience-title">Selected Roles</h2>
          </div>
          <div className="timeline">
            {experience.map((item) => (
              <article className="timeline-item" key={`${item.org}-${item.role}`}>
                <div className="role-mark" aria-hidden="true">
                  <img src={item.iconSrc} alt="" />
                </div>
                <div className="timeline-meta">
                  <span>{item.date}</span>
                </div>
                <div>
                  <h3>{item.role}</h3>
                  <p className="org">{item.org}</p>
                  <p>{item.detail}</p>
                  {"highlights" in item && item.highlights ? (
                    <div className="role-metrics" aria-label="SoloSuit metrics">
                      {item.highlights.map((highlight) => (
                        <div key={highlight.value}>
                          <strong>{highlight.value}</strong>
                          <span>{highlight.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <ul>
                    {item.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-column" aria-label="Education and skills">
          <section>
            <div className="section-heading small">
              <p>Education</p>
              <h2>Carnegie Mellon University</h2>
            </div>
            <p className="aside-copy">
              Computer Science. Published 2 highly-cited web-security papers
              while at CMU.
            </p>
          </section>

          <section>
            <div className="section-heading small">
              <p>Core Strengths</p>
              <h2>Engineering Range</h2>
            </div>
            <div className="skill-list">
              {skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="work-section" aria-labelledby="work-title">
        <div className="section-heading">
          <p>Research and Products</p>
          <h2 id="work-title">Selected Work</h2>
        </div>
        <div className="work-grid">
          {selectedWork.map((work) => (
            <article className="work-item" key={work.title}>
              <div className="work-title-row">
                <img src={work.iconSrc} alt={work.iconAlt} />
                <div>
                  <p>{work.meta}</p>
                  <h3>{work.title}</h3>
                </div>
              </div>
              <span>{work.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
