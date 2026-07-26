"use client";

import { FormEvent, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function ContactPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<"error" | "idle" | "sending" | "sent">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setStatusMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(data?.error ?? "Message could not be sent.");
      }

      form.reset();
      setFiles([]);
      setStatus("sent");
      setStatusMessage("Thanks. Robert will get back to you within 24 hours.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Message could not be sent. Please try again.",
      );
    }
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
          <span>Name</span>
          <input name="name" placeholder="Your name" type="text" />
        </label>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label>
          <span>Phone optional</span>
          <input
            autoComplete="tel"
            name="phone"
            placeholder="Best number to reach you"
            type="tel"
          />
        </label>
        <label>
          <span>Subject</span>
          <input
            name="subject"
            placeholder="What would you like to talk about?"
            required
            type="text"
          />
        </label>
        <label>
          <span>Message</span>
          <textarea
            name="body"
            placeholder="A few details are helpful."
            required
            rows={8}
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
        <button disabled={status === "sending"} type="submit">
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
        <p className={`form-status form-status-${status}`} aria-live="polite">
          {statusMessage}
        </p>
      </form>
      <SiteFooter />
    </main>
  );
}
