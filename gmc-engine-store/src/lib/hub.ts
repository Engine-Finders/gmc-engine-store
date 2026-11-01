import hubPage from "@/data/hubPage.json";
import { pageContext, resolveLinks } from "@/lib/links";

export type HubPageData = (typeof hubPage)[keyof typeof hubPage];

export const hubSlugs = Object.keys(hubPage);

/** Engine hub pages live at /engines/<engineSlug>; the JSON is keyed by that slug. */
export function getHubData(engineSlug: string): HubPageData | undefined {
  const data = (hubPage as Record<string, HubPageData>)[engineSlug];
  return data && resolveLinks(data, pageContext(data.hero.brand));
}
