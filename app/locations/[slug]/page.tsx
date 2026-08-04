import { notFound } from "next/navigation";
import { SmallBusinessLanding } from "@/app/components/SmallBusinessLanding";
import { locationBySlug, supportedLocations } from "@/app/components/locationData";

type LocationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return supportedLocations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = locationBySlug(slug);
  if (!location) return {};

  return {
    title: "Robert Kotcher Web Studio",
    description: `A free first website for ${location.city} small businesses, built within 24 hours with a small site credit.`,
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = locationBySlug(slug);
  if (!location) notFound();

  return <SmallBusinessLanding location={location} />;
}
