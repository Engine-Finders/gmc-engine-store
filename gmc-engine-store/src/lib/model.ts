import modelPage from "@/data/modelPage.json";
import { pageContext, resolveLinks } from "@/lib/links";
import { resolveModelImages } from "@/lib/imageMapping";

export type ModelPageData = (typeof modelPage)[keyof typeof modelPage];

export const modelSlugs = Object.keys(modelPage);

export function getModelData(slug: string): ModelPageData | undefined {
  const data = (modelPage as Record<string, ModelPageData>)[slug];
  return data && resolveModelImages(resolveLinks(data, pageContext(data.brandSlug, data.slug)), data.brandSlug, data.slug);
}
