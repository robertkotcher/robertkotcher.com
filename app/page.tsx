import { SmallBusinessLanding } from "./components/SmallBusinessLanding";
import { locationBySlug } from "./components/locationData";

type HomeProps = {
  searchParams?: Promise<{
    loc?: string | string[];
    location?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const location = locationBySlug(first(params?.location) || first(params?.loc) || "");

  return <SmallBusinessLanding location={location} />;
}
