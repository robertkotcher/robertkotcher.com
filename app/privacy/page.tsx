import { LegalPage } from "../components/LegalPage";

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 4, 2026"
      sections={[
        {
          heading: "Information we collect",
          body: "If you contact us directly, we collect the details you choose to provide, such as your name, email address, business information, and message content.",
        },
        {
          heading: "How we use it",
          body: "We use submitted information to understand your business, reply to you, and improve the service experience.",
        },
        {
          heading: "Service providers",
          body: "We may use hosting, email, analytics, and infrastructure providers to operate this website and deliver messages. These providers process information only as needed to support the site.",
        },
        {
          heading: "Your choices",
          body: "You can ask us to update or delete information you submitted, subject to reasonable operational, security, and legal limits.",
        },
      ]}
    />
  );
}
