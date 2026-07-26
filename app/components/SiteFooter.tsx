export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <a className="footer-brand" href="/">
          <img src="/rk-mark.svg" alt="" />
          <span>robertkotcher.com</span>
        </a>
        <p>App ideas built personally, with direct senior technical support.</p>
      </div>
      <nav aria-label="Footer links">
        <a href="/about">
          <span>About</span>
        </a>
        <a className="footer-contact" href="/contact">
          <span>Contact</span>
        </a>
      </nav>
    </footer>
  );
}
