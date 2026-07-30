export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <a className="footer-brand" href="/">
          <img
            className="brand-wordmark"
            src="/robert-kotcher-wordmark.png"
            alt="Robert Kotcher"
          />
        </a>
        <p>Professional apps at a fraction of the price.</p>
      </div>
      <nav aria-label="Footer links">
        <a className="footer-contact" href="/contact">
          <span>Contact</span>
        </a>
      </nav>
    </footer>
  );
}
