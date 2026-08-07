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
          body: "This website is provided for general information. You agree not to interfere with the site, misuse it, or submit information you do not have the right to share.",
        },
        {
          heading: "Website services",
          body: "Any website work or consulting is subject to separate written agreement. This website does not guarantee any particular business result, ranking, revenue, lead volume, design outcome, or delivery date.",
        },
        {
          heading: "Content you provide",
          body: "You remain responsible for the accuracy, ownership, and legality of business details, images, logos, text, and other materials you provide for project work.",
        },
        {
          heading: "Changes",
          body: "These terms may be updated from time to time. Continued use of the website after updates means you accept the revised terms.",
        },
      ]}
    />
  );
}
