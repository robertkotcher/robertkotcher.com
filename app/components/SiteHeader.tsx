import { Phone } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Site navigation">
      <a className="home-link" href="/">
        <img
          className="brand-logo"
          src="/rk-logo.png"
          alt=""
        />
        <span>Robert Kotcher Web Studio</span>
      </a>
      <a className="header-phone-link" href="tel:4122823952">
        <Phone aria-hidden="true" size={17} strokeWidth={2.3} />
        <span>(412) 282-3952</span>
      </a>
    </header>
  );
}
