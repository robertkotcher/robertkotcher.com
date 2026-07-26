export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Site navigation">
      <a className="home-link" href="/">
        <img src="/rk-mark.svg" alt="" />
        <span>robertkotcher.com</span>
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
