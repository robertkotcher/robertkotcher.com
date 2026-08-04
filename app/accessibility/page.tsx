import { LegalPage } from "../components/LegalPage";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility"
      updated="August 4, 2026"
      sections={[
        {
          heading: "Commitment",
          body: "Robert Kotcher Web Studio aims to make this website clear, keyboard-friendly, readable, and usable across common devices and assistive technologies.",
        },
        {
          heading: "Ongoing work",
          body: "Accessibility is an ongoing practice. We review text contrast, form labels, focus states, page structure, and responsive behavior as the site evolves.",
        },
        {
          heading: "Feedback",
          body: "If something on this site is difficult to use, please reach out with the page, device, browser, and issue so we can improve it.",
        },
      ]}
    />
  );
}
