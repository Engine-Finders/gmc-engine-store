import brandPage from "@/data/brandPage.json";
import { pageContext, resolveLinks } from "@/lib/links";
import { resolveBrandImages } from "@/lib/imageMapping";

// Types are inferred straight from the JSON so new pages/sections stay dynamic.
export type BrandPageData = (typeof brandPage)[keyof typeof brandPage];

export const brandSlugs = Object.keys(brandPage);

export function getBrandData(slug: string): BrandPageData | undefined {
  const data = (brandPage as Record<string, BrandPageData>)[slug];
  return data && resolveBrandImages(resolveLinks(data, pageContext(slug)), slug);
}
