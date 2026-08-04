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
          body: "We use reasonable technical and operational safeguards for submitted messages, uploaded files, email delivery, and database-backed inbox records.",
        },
        {
          heading: "Uploads",
          body: "Please only upload files that are relevant to your website request and that you have permission to share. Do not upload sensitive personal, financial, medical, or confidential legal information.",
        },
        {
          heading: "Reporting issues",
          body: "If you believe you found a security issue, please contact us with enough detail to reproduce and understand the problem.",
        },
      ]}
    />
  );
}
