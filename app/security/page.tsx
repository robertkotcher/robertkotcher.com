import { LegalPage } from "../components/LegalPage";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      updated="August 4, 2026"
      sections={[
        {
          heading: "Reasonable safeguards",
          body: "We use reasonable technical and operational safeguards for the website, analytics, hosting, and any direct messages you choose to send.",
        },
        {
          heading: "Reporting issues",
          body: "If you believe you found a security issue, please contact us with enough detail to reproduce and understand the problem.",
        },
      ]}
    />
  );
}
