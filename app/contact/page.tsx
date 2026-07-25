"use client";

import { FormEvent, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fileNote =
      files.length > 0
        ? `\n\nFiles selected for follow-up: ${files.join(", ")}`
        : "";
    const params = new URLSearchParams({
      subject,
      body: `${body}${fileNote}`,
    });

    window.location.href = `mailto:rkotcher@gmail.com?${params.toString()}`;
  }

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
          <a href="tel:2152923536">215-292-3536</a>
          <p>Email</p>
          <a href="mailto:rkotcher@gmail.com">rkotcher@gmail.com</a>
        </div>
      </section>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contract-note">
          <strong>Development work</strong>
          <p>
            If you are enquiring about development work, please include any
            relevant context, goals, links, constraints, screenshots, or images.
          </p>
        </div>
        <label>
          <span>Subject</span>
          <input
            name="subject"
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What would you like to talk about?"
            required
            type="text"
            value={subject}
          />
        </label>
        <label>
          <span>Message</span>
          <textarea
            name="body"
            onChange={(event) => setBody(event.target.value)}
            placeholder="A few details are helpful."
            required
            rows={8}
            value={body}
          />
        </label>
        <label className="file-control">
          <span>Supporting files</span>
          <input
            multiple
            name="files"
            onChange={(event) =>
              setFiles(
                Array.from(event.target.files ?? []).map((file) => file.name),
              )
            }
            type="file"
          />
          <strong>Attach Files</strong>
          <small>
            {files.length > 0
              ? files.join(", ")
              : "Screenshots, briefs, mockups, or notes are welcome."}
          </small>
        </label>
        <button type="submit">Send Message</button>
      </form>
      <SiteFooter />
    </main>
  );
}
