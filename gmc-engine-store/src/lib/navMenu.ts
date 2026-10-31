import brandPage from "@/data/brandPage.json";
import hubPage from "@/data/hubPage.json";

export type NavMenuItem = { label: string; href: string };
export type NavMenu = { engines: NavMenuItem[]; brands: NavMenuItem[] };

/**
 * Navbar dropdowns are built from the pages that actually exist (one entry per brand page and
 * per engine hub), so the menu never links to a 404 and grows as pages are added.
 */
export function getNavMenu(): NavMenu {
  const brands = Object.entries(brandPage).map(([slug, p]) => ({
    label: (p as { hero: { name?: string; brand?: string } }).hero.name || (p as { hero: { brand?: string } }).hero.brand || slug,
    href: `/${slug}`,
  }));
  const engines = Object.entries(hubPage).map(([slug, p]) => ({
    label: `${(p as { hero: { brand: string } }).hero.brand} ${slug.toUpperCase()} engine`,
    href: `/engines/${slug}`,
  }));
  return { engines, brands };
}
