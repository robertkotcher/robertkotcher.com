"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { LocationLanding } from "./locationData";

type WizardProps = {
  initialStepSlug?: string;
  location: LocationLanding;
};

type WizardData = {
  businessName: string;
  businessType: string;
  currentSite: string;
  goal: string;
  offeringsText: string;
  style: string;
  ownerName: string;
  email: string;
};

type WizardPage = {
  content: string;
  id: string;
  name: string;
};

const initialData: WizardData = {
  businessName: "",
  businessType: "",
  currentSite: "No current website",
  email: "",
  goal: "",
  ownerName: "",
  offeringsText: "",
  style: "",
};

const initialPages: WizardPage[] = [
  { content: "", id: "page-home", name: "Home" },
];

export const wizardStepSlugs = ["business", "goals", "branding", "offerings", "pages", "contact"] as const;

export function WebsiteWizard({ initialStepSlug = "business", location }: WizardProps) {
  const [data, setData] = useState<WizardData>(initialData);
  const [brandingFiles, setBrandingFiles] = useState<File[]>([]);
  const [offeringFiles, setOfferingFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<WizardPage[]>(initialPages);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const steps = useMemo(
    () => [
      {
        eyebrow: "Step 1",
        slug: "business",
        title: "Tell us about the business.",
        copy: "",
      },
      {
        eyebrow: "Step 2",
        slug: "goals",
        title: "What should the website accomplish?",
        copy: "This keeps the draft focused on getting customers to call, book, visit, or ask for a quote.",
      },
      {
        eyebrow: "Step 3",
        slug: "branding",
        title: "Share the branding.",
        copy: "Upload logos, brand guides, color references, screenshots, social graphics, photos, or anything that shows the look you want.",
      },
      {
        eyebrow: "Step 4",
        slug: "offerings",
        title: "Describe the offerings.",
        copy: "Paste details about services, products, prices, packages, hours, locations, FAQs, policies, or upload files that already explain them.",
      },
      {
        eyebrow: "Step 5",
        slug: "pages",
        title: "Plan the pages.",
        copy: "Add as many pages as you want. A page can be simple notes, a rough outline, pasted copy, or detailed instructions.",
      },
      {
        eyebrow: "Step 6",
        slug: "contact",
        title: "Where should your website draft be sent?",
        copy: "Within 24 hours, you'll be emailed a link to a draft of your website. You can request any desired changes at that point.",
      },
    ],
    [],
  );

  const initialStep = Math.max(0, steps.findIndex((item) => item.slug === initialStepSlug));
  const [step, setStep] = useState(initialStep);

  function stepFromUrl() {
    if (typeof window === "undefined") return 0;

    const slug = window.location.pathname.split("/").filter(Boolean).at(-1);
    const index = steps.findIndex((item) => item.slug === slug);

    return index >= 0 ? index : initialStep;
  }

  function setWizardUrl(nextStep: number, mode: "push" | "replace" = "push") {
    if (typeof window === "undefined") return;

    const url = `/wizard/${steps[nextStep].slug}`;

    window.history[mode === "replace" ? "replaceState" : "pushState"](
      { wizardStep: steps[nextStep].slug },
      "",
      url,
    );
  }

  function goToStep(nextStep: number, mode: "push" | "replace" = "push") {
    const boundedStep = Math.max(0, Math.min(steps.length - 1, nextStep));
    setStep(boundedStep);
    setWizardUrl(boundedStep, mode);
  }

  useEffect(() => {
    setStep(stepFromUrl());

    function syncStepFromHistory() {
      setStep(stepFromUrl());
    }

    window.addEventListener("popstate", syncStepFromHistory);
    return () => window.removeEventListener("popstate", syncStepFromHistory);
  }, [steps]);

  function update(field: keyof WizardData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function addFiles(kind: "branding" | "offerings", event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files || []);
    if (!selected.length) return;

    if (kind === "branding") {
      setBrandingFiles((current) => [...current, ...selected]);
    } else {
      setOfferingFiles((current) => [...current, ...selected]);
    }

    event.currentTarget.value = "";
  }

  function removeFile(kind: "branding" | "offerings", indexToRemove: number) {
    if (kind === "branding") {
      setBrandingFiles((current) => current.filter((_, index) => index !== indexToRemove));
    } else {
      setOfferingFiles((current) => current.filter((_, index) => index !== indexToRemove));
    }
  }

  function addPage() {
    setPages((current) => [
      ...current,
      { content: "", id: `page-${Date.now()}`, name: "" },
    ]);
  }

  function updatePage(id: string, field: "content" | "name", value: string) {
    setPages((current) => current.map((page) => (
      page.id === id ? { ...page, [field]: value } : page
    )));
  }

  function removePage(id: string) {
    setPages((current) => current.length > 1 ? current.filter((page) => page.id !== id) : current);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (step < steps.length - 1) {
      goToStep(step + 1);
      return;
    }

    setSubmitting(true);
    setStatus("");
    setSent(false);

    const formData = new FormData();
    formData.set("name", data.ownerName || data.businessName);
    formData.set("email", data.email);
    formData.set("subject", `Free 24-hour website request: ${data.businessName || location.city}`);
    formData.set(
      "body",
      [
        `Craigslist location: ${location.city}, ${location.region} (${location.craigslistCode})`,
        `Business name: ${data.businessName || "Not provided"}`,
        `Business type: ${data.businessType || "Not provided"}`,
        `Current site: ${data.currentSite || "Not provided"}`,
        `Main goal: ${data.goal || "Not provided"}`,
        `Style notes: ${data.style || "Not provided"}`,
        `Branding files: ${brandingFiles.length ? brandingFiles.map((file) => file.name).join(", ") : "None uploaded"}`,
        "",
        "Business offerings:",
        data.offeringsText || "Not provided",
        `Offering files: ${offeringFiles.length ? offeringFiles.map((file) => file.name).join(", ") : "None uploaded"}`,
        "",
        "Requested pages:",
        ...pages.map((page, index) => [
          `${index + 1}. ${page.name || "Untitled page"}`,
          page.content || "No content provided.",
        ].join("\n")),
        "",
        "Offer shown: Free website built within 24 hours. Free with footer credit and link to robertkotcher.com; paid only if the business wants that credit removed.",
      ].join("\n"),
    );
    [...brandingFiles, ...offeringFiles].forEach((file) => formData.append("files", file));

    const response = await fetch("/api/contact", {
      body: formData,
      method: "POST",
    });
    const result = await response.json().catch(() => ({}));

    setSubmitting(false);
    if (!response.ok) {
      setStatus(result.error || "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
    setStatus("Thanks for your submission. We'll be in touch soon!");
  }

  return (
    <section className="wizard-card" id="website-wizard" aria-labelledby="wizard-title">
      <div className="wizard-progress" aria-label="Wizard progress">
        {steps.map((item, index) => (
          <button
            aria-label={`Go to ${item.eyebrow}`}
            aria-current={index === step ? "step" : undefined}
            disabled={index > step}
            key={item.eyebrow}
            onClick={() => goToStep(index)}
            type="button"
          />
        ))}
      </div>
      <p className="eyebrow">{steps[step].eyebrow}</p>
      <h2 id="wizard-title">{steps[step].title}</h2>
      {steps[step].copy ? <p className="wizard-copy">{steps[step].copy}</p> : null}
      <form onSubmit={submit}>
        {step === 0 ? (
          <>
            <label>
              <span>Business name</span>
              <input value={data.businessName} onChange={(event) => update("businessName", event.target.value)} required />
            </label>
            <label>
              <span>What kind of business?</span>
              <input value={data.businessType} onChange={(event) => update("businessType", event.target.value)} placeholder="Restaurant, salon, contractor, shop..." required />
            </label>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <label>
              <span>Current website</span>
              <select value={data.currentSite} onChange={(event) => update("currentSite", event.target.value)}>
                <option>No current website</option>
                <option>Old site that needs a refresh</option>
                <option>I have a domain already</option>
              </select>
            </label>
            <label>
              <span>Main goal</span>
              <textarea value={data.goal} onChange={(event) => update("goal", event.target.value)} placeholder="Get calls, bookings, quote requests, menu views, event inquiries..." required rows={3} />
            </label>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <label>
              <span>Style notes</span>
              <textarea value={data.style} onChange={(event) => update("style", event.target.value)} placeholder="Clean and modern, warm and local, high-end, simple and practical..." rows={3} />
            </label>
            <label className="file-control wizard-file-control">
              <span>Branding files <em>(optional)</em></span>
              <strong>{brandingFiles.length ? `${brandingFiles.length} file${brandingFiles.length === 1 ? "" : "s"} selected` : "Upload branding files"}</strong>
              <small>Logos, brand guides, photos, screenshots, colors, social posts, menus, flyers, or anything visual.</small>
              {brandingFiles.length ? (
                <ul className="selected-files">
                  {brandingFiles.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${index}`}>
                      <span>{file.name}</span>
                      <button aria-label={`Remove ${file.name}`} onClick={(event) => { event.preventDefault(); removeFile("branding", index); }} type="button">x</button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <input multiple name="brandingFiles" onChange={(event) => addFiles("branding", event)} type="file" />
            </label>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <label>
              <span>Business offerings</span>
              <textarea
                value={data.offeringsText}
                onChange={(event) => update("offeringsText", event.target.value)}
                placeholder="List services, products, prices, packages, service areas, hours, booking rules, common questions, guarantees, or anything customers should understand."
                rows={8}
              />
            </label>
            <label className="file-control wizard-file-control">
              <span>Offering files <em>(optional)</em></span>
              <strong>{offeringFiles.length ? `${offeringFiles.length} file${offeringFiles.length === 1 ? "" : "s"} selected` : "Upload offering files"}</strong>
              <small>Price sheets, brochures, menus, service lists, PDFs, notes, or docs are helpful here.</small>
              {offeringFiles.length ? (
                <ul className="selected-files">
                  {offeringFiles.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${index}`}>
                      <span>{file.name}</span>
                      <button aria-label={`Remove ${file.name}`} onClick={(event) => { event.preventDefault(); removeFile("offerings", index); }} type="button">x</button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <input multiple name="offeringFiles" onChange={(event) => addFiles("offerings", event)} type="file" />
            </label>
          </>
        ) : null}
        {step === 4 ? (
          <div className="wizard-page-list">
            {pages.map((page, index) => (
              <div className="wizard-page-card" key={page.id}>
                <div className="wizard-page-head">
                  <strong>Page {index + 1}</strong>
                  {pages.length > 1 ? <button onClick={() => removePage(page.id)} type="button">Remove</button> : null}
                </div>
                <label>
                  <span>Page name</span>
                  <input
                    value={page.name}
                    onChange={(event) => updatePage(page.id, "name", event.target.value)}
                    placeholder="Home, Services, About, Gallery, Menu, Contact..."
                    required
                  />
                </label>
                <label>
                  <span>Page content</span>
                  <textarea
                    value={page.content}
                    onChange={(event) => updatePage(page.id, "content", event.target.value)}
                    placeholder="Paste draft copy, bullet points, sections, offers, photos needed, calls to action, examples, or notes for this page. More detail is welcome."
                    rows={7}
                  />
                </label>
              </div>
            ))}
            <button className="secondary-action wizard-add-page" onClick={addPage} type="button">Add another page</button>
          </div>
        ) : null}
        {step === 5 ? (
          <>
            <label>
              <span>Your name <em>(optional)</em></span>
              <input value={data.ownerName} onChange={(event) => update("ownerName", event.target.value)} autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input value={data.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required type="email" />
            </label>
          </>
        ) : null}
        {sent ? <p className="wizard-status wizard-status-sent">{status}</p> : null}
        {!sent ? (
          <div className="wizard-actions">
            {step > 0 ? <button className="secondary-action" onClick={() => goToStep(step - 1)} type="button">Back</button> : null}
            <button className="primary-action" disabled={submitting} type="submit">
              {step === steps.length - 1 ? (submitting ? "Sending..." : "Send my website request") : "Continue"}
            </button>
          </div>
        ) : null}
        {!sent && status ? <p className="wizard-status">{status}</p> : null}
      </form>
    </section>
  );
}
