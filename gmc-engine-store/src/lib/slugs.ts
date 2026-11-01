/**
 * URL conventions shared by the server-side link resolver (src/lib/links.ts) and client components.
 * Nothing in here touches the file system, so client components can import it.
 *
 *   brand page    /<brand>-engines                 e.g. /mercedes-benz-engines   (src/data/brandPage.json key)
 *   model page    /<brand>-engines/<model>         e.g. /mercedes-benz-engines/c-class (src/data/modelPage.json)
 *   engine hub    /engines/<engine>                e.g. /engines/om651           (src/data/hubPage.json key)
 *   listing       /engines/<engine>/<application>  (src/data/listings/<engine>/<application>.json)
 */

// Listing data uses short brand codes ("mercedes", "landrover"); the brand page slug is the brand
// name slugified + "-engines". Only codes that differ from the brand name need an entry here.
const BRAND_PAGE_SLUG: Record<string, string> = {
  mercedes: "mercedes-benz-engines",
  mercedesbenz: "mercedes-benz-engines",
  landrover: "land-rover-engines",
  vw: "volkswagen-engines",
};

/** "Mercedes-Benz", "mercedes", "Land Rover", "landrover" -> brand page slug (without the leading /). */
export function brandSlugFor(brand: string): string {
  const slug = brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-engines$/, "");
  return BRAND_PAGE_SLUG[slug.replace(/-/g, "")] ?? `${slug}-engines`;
}

/** Pages that exist without a JSON entry. */
export const STATIC_PAGES = new Set(["/", "/contact"]);

/**
 * Planned URLs that have no page yet, and where links to them go in the meantime.
 * When one of these pages is built, delete its line here (and add it to STATIC_PAGES).
 */
export const STATIC_FALLBACK: Record<string, string> = {
  "/engines": "/#featured-engines",
  "/brands": "/#shop-by-brand",
  "/guides": "/#buyers-guides",
  "/warranty": "/#warranty-delivery",
  "/delivery": "/#warranty-delivery",
  "/returns": "/#warranty-delivery",
  "/about": "/contact",
  "/privacy": "/contact",
  "/terms": "/contact",
};

/** For hard-coded links in client components (the full resolver needs the server). */
export function staticHref(href: string): string {
  return STATIC_FALLBACK[href] ?? href;
}
