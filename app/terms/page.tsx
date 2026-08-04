import { LegalPage } from "../components/LegalPage";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="August 4, 2026"
      sections={[
        {
          heading: "Use of this website",
          body: "This website is provided for general information and project intake. You agree not to misuse the forms, upload malicious files, interfere with the site, or submit information you do not have the right to share.",
        },
        {
          heading: "Website drafts",
          body: "A submitted request does not guarantee any particular business result, ranking, revenue, lead volume, design outcome, delivery date, or ongoing availability of a free offer.",
        },
        {
          heading: "Content you submit",
          body: "You remain responsible for the accuracy, ownership, and legality of business details, images, logos, text, files, and other materials you provide.",
        },
        {
          heading: "Changes",
          body: "These terms may be updated from time to time. Continued use of the website after updates means you accept the revised terms.",
        },
      ]}
    />
  );
}
