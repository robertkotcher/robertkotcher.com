"use client";

import { profileLinks } from "./profileLinks";

export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Profile links">
      <a className="home-link" href="/">
        <img src="/rk-mark.svg" alt="" />
        <span>robertkotcher.com</span>
      </a>
      <nav>
        {profileLinks.map((link) => (
          <a
            href={link.href}
            key={link.href}
            rel="noreferrer"
            target="_blank"
            title={link.label}
          >
            <img src={link.icon} alt="" />
            <span>{link.label}</span>
          </a>
        ))}
        <a className="contact-button" href="/contact">
          Contact
        </a>
      </nav>
    </header>
  );
}
