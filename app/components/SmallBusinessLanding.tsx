import { Phone } from "lucide-react";
import { SiteFooter } from "./SiteFooter";

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
            <nav className="sb-header-nav" aria-label="Primary navigation">
              <a href="/pricing">Pricing</a>
            </nav>
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

      <SiteFooter />
    </main>
  );
}
