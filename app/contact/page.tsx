import { ContactForm } from "./ContactForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function ContactPage() {
  return (
    <main className="cv-page contact-page">
      <SiteHeader />
      <section className="contact-hero" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 id="contact-title">Get In Touch</h1>
          <p className="summary">
            Robert will get back to you within 24 hours.
          </p>
        </div>
        <div className="contact-card" aria-label="Contact details">
          <p>Phone</p>
          <a href="tel:4122823952">(412) 282-3952</a>
          <p>Email</p>
          <a href="mailto:rkotcher@gmail.com">rkotcher@gmail.com</a>
        </div>
      </section>
      <ContactForm />

      <SiteFooter />
    </main>
  );
}
