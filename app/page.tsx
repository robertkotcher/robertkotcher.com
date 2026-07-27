import { AppCarousel } from "./components/AppCarousel";
import { CostContextModal } from "./components/CostContextModal";
import { PromoBanner } from "./components/PromoBanner";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

export default function Home() {
  const proofPoints = [
    { value: "CMU CS", label: "Carnegie Mellon computer science graduate" },
    { value: "10+ yrs", label: "turning ideas into working software" },
    { value: "3 apps", label: "apps I built that were acquired" },
    { value: "8M", label: "users on a mobile product I helped build" },
  ];

  const offerItems = [
    "Weekly video call to review progress and decide what matters next.",
    "Daily email and text support for questions, feedback, and decisions.",
    "Design, development, launch, hosting guidance, and ongoing maintenance.",
    "No technical or product experience required to work together.",
  ];

  const process = [
    {
      step: "01",
      title: "Tell me the idea",
      copy:
        "We start with the outcome you want, who it helps, what you already have, and what would make the first version useful.",
    },
    {
      step: "02",
      title: "Shape the first version",
      copy:
        "I translate the vision into a clear build plan: what to include now, what to skip, and what should stay flexible.",
    },
    {
      step: "03",
      title: "Build in the open",
      copy:
        "You see steady progress, send feedback as it becomes real, and get direct access to the person doing the work.",
    },
    {
      step: "04",
      title: "Launch and improve",
      copy:
        "Once it is live, we keep it running, refine what users need, and add the next useful piece.",
    },
  ];

  const appSlides = [
    {
      eyebrow: "Education platform",
      title: "Expii",
      description:
        "A learning platform from a Carnegie Mellon math professor's spinoff company, built around helping students choose how they learn.",
      icon: "/expii-favicon.png",
      iconAlt: "Expii icon",
      image: "/expii-homepage.png",
      imageAlt: "Expii homepage showing learning search and lesson options",
      link: "https://expii.com/",
    },
    {
      eyebrow: "Screen-time mobile app",
      title: "Moment",
      description:
        "An iOS and Android app that helped people monitor screen time, understand phone habits, and build healthier routines.",
      icon: "/moment-icon.png",
      iconAlt: "Moment icon",
      image: "/moment-overview.png",
      imageAlt: "Moment app screens showing phone use and screen time tracking",
    },
    {
      eyebrow: "AI work-app hub",
      title: "Threads",
      description:
        "A workplace app that helps employees monitor all of their work apps and manage them with AI in one place.",
      icon: "/threads-logo.png",
      iconAlt: "Threads icon",
      image: "/threads-homepage.png",
      imageAlt: "Threads app interface showing a support-request workflow plan",
      link: "https://threads.site/",
    },
    {
      eyebrow: "Board-game community app",
      title: "BoardGameHQ",
      description:
        "A local board-game events product that helps people host game nights, find nearby events, and organize players around tables.",
      icon: "/boardgamehq-icon.png",
      iconAlt: "BoardGameHQ icon",
      image: "/boardgamehq-homepage.png",
      imageAlt: "BoardGameHQ event page showing a Friday game night",
      link: "https://boardgamehq.com/",
    },
  ];

  return (
    <main className="cv-page">
      <SiteHeader />

      <section className="studio-hero" aria-labelledby="hero-title">
        <div className="hero-intro">
          <div className="hero-copy">
            <p className="eyebrow">Professional apps, built personally</p>
            <h1 id="hero-title">Have an app idea you keep meaning to build?</h1>
            <p className="summary">
              I&apos;m Robert Kotcher, a Carnegie Mellon computer science graduate
              who helps people turn ideas into working apps without breaking the
              bank.
            </p>
          </div>
          <aside className="hero-card" aria-label="Robert Kotcher">
            <div className="portrait-wrap">
              <img
                src="/robert-kotcher-osaka.jpg"
                alt="Robert Kotcher"
                className="portrait"
              />
            </div>
            <div className="signature-note">
              <p>
                My goal is to make development feel less transactional and more
                personal: building an app you&apos;re proud of, in a way that
                stays affordable.
              </p>
              <img
                src="/robert-kotcher-signature.png"
                alt="Robert Kotcher signature"
                className="signature-image"
              />
            </div>
          </aside>
        </div>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="primary-action" href="/contact">
            Reach Out Today
          </a>
          <a className="secondary-action" href="/contact">
            Send Your Idea
          </a>
        </div>
      </section>

      <section className="proof-strip" aria-label="Track record">
        {proofPoints.map((point) => (
          <div className="proof-item" key={point.value}>
            <strong>{point.value}</strong>
            <span>{point.label}</span>
          </div>
        ))}
      </section>

      <section className="offer-section" aria-labelledby="offer-title">
        <div>
          <h2 id="offer-title">Your technical partner for $850/month.</h2>
          <p>
            <CostContextModal /> My model is simple: one senior technical
            partner who can meet weekly, answer questions directly, and handle
            the practical work of designing, building, launching, and
            maintaining your app.
          </p>
        </div>
        <div className="offer-card">
          <span>$850/mo</span>
          <h3>Direct App Partner</h3>
          <ul>
            {offerItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a href="/contact">Start a Conversation</a>
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div className="section-heading">
          <p>How it works</p>
          <h2 id="process-title">Visible progress from idea to launch.</h2>
        </div>
        <div className="process-list">
          {process.map((item) => (
            <article className="process-item" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="note-section" aria-labelledby="note-title">
        <div>
          <p className="eyebrow">A personal note</p>
          <h2 id="note-title">I care about doing things right.</h2>
        </div>
        <p>
          Good software starts with listening and asking the right questions.
          I&apos;ll help you sort through the idea, make practical decisions,
          and build toward something people can actually use. You do not need
          to speak in technical language or arrive with a perfect plan. Bring
          the vision, the rough edges, and the constraints. We&apos;ll turn them
          into a working product together.
        </p>
      </section>

      <section className="apps-section" aria-labelledby="apps-title">
        <AppCarousel slides={appSlides} />
      </section>

      <section className="final-cta" aria-labelledby="final-cta-title">
        <div className="final-cta-copy">
          <p className="eyebrow">Ready when you are</p>
          <h2 id="final-cta-title">Ready to make your app real?</h2>
          <p>
            Send me the rough idea, the goal, or the problem you keep coming
            back to. I&apos;ll help you figure out the practical next step.
          </p>
        </div>
        <div className="final-cta-actions">
          <a className="primary-action" href="/contact">
            Send Your Idea
          </a>
          <div className="final-contact-links" aria-label="Direct contact">
            <a href="tel:2152923536">Call or text 215-292-3536</a>
            <a href="mailto:rkotcher@gmail.com">rkotcher@gmail.com</a>
          </div>
        </div>
      </section>

      <SiteFooter />
      <PromoBanner />
    </main>
  );
}
