import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { SiteFooter } from "@/app/components/SiteFooter";
import { WebsiteWizard } from "@/app/components/WebsiteWizard";
import { defaultLocation } from "@/app/components/locationData";

const wizardStepSlugs = ["business", "goals", "branding", "offerings", "pages", "contact"] as const;

type WizardStep = (typeof wizardStepSlugs)[number];

type WizardStepPageProps = {
  params: Promise<{
    step: string;
  }>;
};

function isWizardStep(step: string): step is WizardStep {
  return wizardStepSlugs.includes(step as WizardStep);
}

export function generateStaticParams() {
  return wizardStepSlugs.map((step) => ({ step }));
}

export const metadata = {
  title: "Robert Kotcher Web Studio",
};

export default async function WizardStepPage({ params }: WizardStepPageProps) {
  const { step } = await params;

  if (!isWizardStep(step)) notFound();

  return (
    <main className="cv-page small-business-page wizard-page">
      <header className="sb-brand" aria-label="Robert Kotcher Web Studio">
        <a className="sb-brand-home" href="/">
          <img src="/rk-logo.png" alt="" />
          <span>Robert Kotcher Web Studio</span>
        </a>
        <a className="sb-phone-pill" href="tel:4122823952">
          <Phone aria-hidden="true" size={17} strokeWidth={2.3} />
          <span>(412) 282-3952</span>
        </a>
      </header>
      <section className="sb-wizard-section sb-wizard-section-single" aria-label="Website wizard">
        <WebsiteWizard initialStepSlug={step} location={defaultLocation} />
      </section>
      <SiteFooter />
    </main>
  );
}
