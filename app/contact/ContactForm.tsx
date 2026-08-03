"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setSent(false);
    setSubmitting(true);

    const form = event.currentTarget;
    const response = await fetch("/api/contact", {
      body: new FormData(form),
      method: "POST",
    });
    const data = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setStatus(data.error || "Message could not be sent. Please try again.");
      return;
    }

    form.reset();
    setFiles([]);
    setSent(true);
    setStatus("Message sent.");
  }

  return (
    <form className="contact-form" onSubmit={submitForm}>
      <label>
        <span>Name <em>(optional)</em></span>
        <input autoComplete="name" name="name" type="text" />
      </label>
      <label>
        <span>Email</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        <span>Phone <em>(optional)</em></span>
        <input autoComplete="tel" name="phone" type="tel" />
      </label>
      <label>
        <span>Subject</span>
        <input name="subject" required type="text" />
      </label>
      <label>
        <span>Message</span>
        <textarea name="body" required rows={7} />
      </label>
      <label className="file-control">
        <span>Attachments <em>(optional)</em></span>
        <strong>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Add files"}</strong>
        <small>Up to 3MB total.</small>
        {files.length ? <ul className="selected-files">{files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul> : null}
        <input multiple name="files" onChange={(event) => setFiles(Array.from(event.target.files || []))} type="file" />
      </label>
      <button disabled={submitting} type="submit">
        {submitting ? "Sending..." : "Send message"}
      </button>
      <p className={`form-status ${sent ? "form-status-sent" : status ? "form-status-error" : ""}`} aria-live="polite">
        {status}
      </p>
    </form>
  );
}
