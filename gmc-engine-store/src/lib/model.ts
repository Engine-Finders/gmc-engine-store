import modelPage from "@/data/modelPage.json";

export type ModelPageData = (typeof modelPage)[keyof typeof modelPage];

export const modelSlugs = Object.keys(modelPage);

export function getModelData(slug: string): ModelPageData | undefined {
  return (modelPage as Record<string, ModelPageData>)[slug];
}
