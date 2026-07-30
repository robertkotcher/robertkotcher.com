export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Site navigation">
      <a className="home-link" href="/">
        <img
          className="brand-wordmark"
          src="/robert-kotcher-wordmark.png"
          alt="Robert Kotcher"
        />
      </a>
      <nav>
        <a href="/about">
          <span>About</span>
        </a>
        <a className="contact-button" href="/contact">
          <span>Contact</span>
        </a>
      </nav>
    </header>
  );
}
