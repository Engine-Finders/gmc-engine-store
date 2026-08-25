import brandPage from "@/data/brandPage.json";

// Types are inferred straight from the JSON so new pages/sections stay dynamic.
export type BrandPageData = (typeof brandPage)[keyof typeof brandPage];

export const brandSlugs = Object.keys(brandPage);

export function getBrandData(slug: string): BrandPageData | undefined {
  return (brandPage as Record<string, BrandPageData>)[slug];
}
