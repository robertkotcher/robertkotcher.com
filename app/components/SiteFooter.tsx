import { profileLinks } from "./profileLinks";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <a className="footer-brand" href="/">
          <img src="/rk-mark.svg" alt="" />
          <span>robertkotcher.com</span>
        </a>
        <p>Software engineering, product systems, and selective contract work.</p>
      </div>
      <nav aria-label="Footer links">
        {profileLinks.map((link) => (
          <a
            href={link.href}
            key={link.href}
            rel="noreferrer"
            target="_blank"
          >
            <img src={link.icon} alt="" />
            <span>{link.label}</span>
          </a>
        ))}
        <a className="footer-contact" href="/contact">
          <span>Contact</span>
        </a>
      </nav>
    </footer>
  );
}
