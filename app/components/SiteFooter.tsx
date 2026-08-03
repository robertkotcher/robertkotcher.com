export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-block">
        <p>Professional apps at a fraction of the price.</p>
      </div>
      <div className="footer-company">
        <strong>Actually Useful Things</strong>
        <span>&copy; 2026 Actually Useful Things. All rights reserved.</span>
      </div>
      <nav aria-label="Footer links">
        <a className="footer-contact" href="/contact">
          <span>Contact</span>
        </a>
      </nav>
    </footer>
  );
}
