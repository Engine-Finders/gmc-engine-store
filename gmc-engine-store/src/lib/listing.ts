import listingPage from "@/data/listingPage.json";

export type ListingPageData = (typeof listingPage)[keyof typeof listingPage];

export const listingKeys = Object.keys(listingPage);

/** Routes are /engines/<engineSlug>/<applicationSlug>; the JSON is keyed by both joined. */
export function getListingData(engineSlug: string, applicationSlug: string): ListingPageData | undefined {
  return (listingPage as Record<string, ListingPageData>)[`${engineSlug}-${applicationSlug}`];
}

export function listingParams() {
  return Object.values(listingPage as Record<string, ListingPageData>).map((d) => ({
    engineSlug: d.engineSlug,
    applicationSlug: d.applicationSlug,
  }));
}
