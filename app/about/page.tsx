import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "About Robert Kotcher - robertkotcher.com",
  description:
    "About Robert Kotcher, a Carnegie Mellon computer science graduate who helps people turn app ideas into working software.",
};

export default function AboutPage() {
  const proof = [
    {
      value: "10+ years",
      label: "building real products for startups, research groups, and people with ambitious ideas",
    },
    {
      value: "$2.7B",
      label: "in debt protected through software I help build at SoloSuit",
    },
    {
      value: "8M users",
      label: "on a mobile product I contributed to before focusing on founder-led builds",
    },
  ];

  const principles = [
    "I translate rough ideas into practical first versions.",
    "I explain technical tradeoffs without making people feel small.",
    "I care about the end user, not just the code.",
    "I build systems that can keep improving after launch.",
  ];

  return (
    <main className="cv-page about-page">
      <SiteHeader />

      <section className="about-hero" aria-labelledby="about-title">
        <div>
          <p className="eyebrow">About Robert</p>
          <h1 id="about-title">I build software for people who care about the idea.</h1>
        </div>
        <p className="summary">
          I&apos;m a Carnegie Mellon computer science graduate and software
          engineer who has spent more than a decade turning ideas into products,
          tools, research systems, and businesses. My work is technical, but my
          job is human: understand what you are trying to make, find the simplest
          useful path forward, and build it well.
        </p>
      </section>

      <section className="about-intro" aria-label="Working style">
        <div className="portrait-wrap">
          <img
            className="portrait"
            src="/robert-kotcher.png"
            alt="Robert Kotcher"
          />
        </div>
        <div>
          <h2>Good software should feel like momentum.</h2>
          <p>
            Hiring an agency can feel too big. Hiring a developer can feel hard
            to manage. Learning everything yourself can take months before the
            real work even begins.
          </p>
          <p>
            I try to make the process simpler. You bring the vision, context,
            users, and constraints. I bring senior engineering judgment, product
            sense, careful communication, and the habit of shipping working
            software.
          </p>
        </div>
      </section>

      <section className="about-proof" aria-label="Selected proof points">
        {proof.map((item) => (
          <article key={item.value}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="about-principles" aria-labelledby="principles-title">
        <div>
          <p className="eyebrow">How I work</p>
          <h2 id="principles-title">Capable, direct, and on your side.</h2>
        </div>
        <ul>
          {principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </section>

      <section className="about-close" aria-labelledby="about-close-title">
        <p className="eyebrow">The short version</p>
        <h2 id="about-close-title">
          I&apos;m good at making vague software ideas become clear, useful, and
          real.
        </h2>
        <p>
          If you have been carrying an app idea around for a while, I can help
          you decide what the first version should be, build it, launch it, and
          keep improving it with you.
        </p>
        <a className="primary-action" href="/contact">
          Tell Me Your Idea
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
