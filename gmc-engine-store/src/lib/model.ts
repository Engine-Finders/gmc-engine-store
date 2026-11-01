import modelPage from "@/data/modelPage.json";
import { pageContext, resolveLinks } from "@/lib/links";

export type ModelPageData = (typeof modelPage)[keyof typeof modelPage];

export const modelSlugs = Object.keys(modelPage);

export function getModelData(slug: string): ModelPageData | undefined {
  const data = (modelPage as Record<string, ModelPageData>)[slug];
  return data && resolveLinks(data, pageContext(data.brandSlug, data.slug));
}
