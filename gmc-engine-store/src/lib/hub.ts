import hubPage from "@/data/hubPage.json";

export type HubPageData = (typeof hubPage)[keyof typeof hubPage];

export const hubSlugs = Object.keys(hubPage);

/** Engine hub pages live at /engines/<engineSlug>; the JSON is keyed by that slug. */
export function getHubData(engineSlug: string): HubPageData | undefined {
  return (hubPage as Record<string, HubPageData>)[engineSlug];
}
