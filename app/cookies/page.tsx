import { LegalPage } from "../components/LegalPage";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Notice"
      updated="August 4, 2026"
      sections={[
        {
          heading: "Essential storage",
          body: "This site may use essential browser storage or cookies to support normal website behavior, security, analytics, and form functionality.",
        },
        {
          heading: "Analytics",
          body: "Basic analytics may help us understand page performance and usage patterns. We use this information to improve the site.",
        },
        {
          heading: "Controls",
          body: "You can control cookies and local storage through your browser settings. Blocking some storage may affect normal site behavior.",
        },
      ]}
    />
  );
}
