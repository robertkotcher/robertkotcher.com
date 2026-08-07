import { Check } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

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

export default function PricingPage() {
  return (
    <main className="cv-page pricing-page">
      <SiteHeader />
      <section className="pricing-hero" aria-labelledby="pricing-title">
        <p className="eyebrow" id="pricing-title">Pricing</p>
        <p>
          Simple monthly care for small business websites, with hosting, updates, and analytics support handled for you.
        </p>
      </section>
      <section className="pricing-grid" aria-label="Pricing tiers">
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
      <section className="pricing-quality" aria-label="Quality promise">
        <p>
          A professional designer and developer will personally make sure your website is built to a high standard:
          polished, clear, mobile-friendly, and ready to help customers trust your business.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
