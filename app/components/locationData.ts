export type LocationLanding = {
  city: string;
  region: string;
  slug: string;
  craigslistCode: string;
};

export const defaultLocation: LocationLanding = {
  city: "Albuquerque",
  craigslistCode: "abq",
  region: "New Mexico",
  slug: "abq",
};

export const supportedLocations: LocationLanding[] = [
  defaultLocation,
];

export function locationBySlug(slug: string) {
  return supportedLocations.find((location) => location.slug === slug);
}
