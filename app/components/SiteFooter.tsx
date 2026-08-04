export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <a className="footer-brand-home" href="/">
            <img src="/rk-logo.png" alt="" />
            <span>Robert Kotcher Web Studio</span>
          </a>
          <p>Capture more leads from your business website</p>
        </div>
        <img className="footer-signature" src="/robert-kotcher-signature.png" alt="Robert Kotcher signature" />
      </div>
      <div className="footer-bottom">
        <nav className="footer-legal-links" aria-label="Footer links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
          <a href="/accessibility">Accessibility</a>
          <a href="/cookies">Cookie Notice</a>
          <a href="/security">Security</a>
          <a href="/sitemap">Sitemap</a>
        </nav>
        <div className="footer-company">
          <span>&copy; 2026 Robert Kotcher Web Studio. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
