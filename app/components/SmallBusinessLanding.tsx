import { Check, Phone } from "lucide-react";
import { SiteFooter } from "./SiteFooter";

const tiers = [
  {
    description:
      "Hosting, light content updates, website analytics reports, and a small robertkotcher.com site credit in the footer.",
    features: [
      "Managed website hosting",
      "Content updates included",
      "Website analytics reports",
      "Small site credit and robertkotcher.com link",
    ],
    name: "Site Credit",
    price: "$25",
  },
  {
    description:
      "Everything in the Site Credit plan, with the Robert Kotcher Web Studio footer credit and link removed.",
    features: [
      "Managed website hosting",
      "Content updates included",
      "Website analytics reports",
      "No studio credit or footer link",
    ],
    name: "White Label",
    price: "$50",
  },
];

export function SmallBusinessLanding() {
  return (
    <main className="cv-page small-business-page">
      <section className="sb-hero" aria-labelledby="hero-title">
        <header className="sb-brand" aria-label="Robert Kotcher Web Studio">
          <a className="sb-brand-home" href="/">
            <img src="/rk-logo.png" alt="" />
            <span>Robert Kotcher Web Studio</span>
          </a>
          <div className="sb-header-actions">
            <a className="sb-phone-pill" href="tel:4122823952">
              <Phone aria-hidden="true" size={17} strokeWidth={2.3} />
              <span>(412) 282-3952</span>
            </a>
          </div>
        </header>
        <div className="sb-hero-grid">
          <div className="sb-hero-copy">
            <p className="sb-hero-eyebrow">For small businesses</p>
            <h1 id="hero-title">Get more local leads from your website</h1>
            <p className="sb-hero-summary">
              We build and maintain websites that help small businesses capture quote requests, appointments, customer forms, and service inquiries.
            </p>
          </div>
          <div className="sb-hero-media" aria-label="Small business owner reviewing leads">
            <img src="/hero-owner.jpg" alt="Small business owner checking customer leads on his phone" />
            <div className="sb-lead-card" aria-label="Example customer inquiries">
              <div className="sb-lead-card-head">
                <strong>Customer inquiries</strong>
                <span>2 unanswered</span>
              </div>
              <ul>
                <li>
                  <i aria-hidden="true">◎</i>
                  <div><strong>Dana W.</strong><span>Weekly mowing - 0.4 acre</span></div>
                  <time>2 min ago</time>
                </li>
                <li>
                  <i aria-hidden="true">◎</i>
                  <div><strong>Marcus T.</strong><span>Spring cleanup + mulch</span></div>
                  <time>41 min ago</time>
                </li>
                <li>
                  <i aria-hidden="true">✓</i>
                  <div><strong>Ellen R.</strong><span>Hedge trimming, 3 photos</span></div>
                  <time>Yesterday</time>
                </li>
              </ul>
              <p>Every request also goes straight to your phone by text and email.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-hero landing-pricing-intro" aria-labelledby="pricing-title">
        <p className="eyebrow" id="pricing-title">Pricing</p>
        <p>
          Simple monthly care for small business websites, with hosting, updates, and analytics support handled for you.
        </p>
      </section>
      <section className="pricing-grid landing-pricing-grid" aria-label="Pricing tiers">
        {tiers.map((tier) => (
          <article className="pricing-card" key={tier.name}>
            <div className="pricing-card-head">
              <h2>{tier.name}</h2>
              <p>{tier.description}</p>
            </div>
            <div className="pricing-price">
              <strong>{tier.price}</strong>
              <span>/ month</span>
            </div>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>
                  <Check aria-hidden="true" size={17} strokeWidth={2.4} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="pricing-quality landing-pricing-quality" aria-label="Quality promise">
        <p>
          A professional designer and developer will personally make sure your website is built to a high standard:
          polished, clear, mobile-friendly, and ready to help customers trust your business.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
