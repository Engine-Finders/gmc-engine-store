import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelThemeShell from "@/components/model/ModelThemeShell";
import ModelHero from "@/components/model/ModelHero";
import ModelFeatured from "@/components/model/ModelFeatured";
import ModelEngineTable from "@/components/model/ModelEngineTable";
import ModelPriceGuide from "@/components/model/ModelPriceGuide";
import ModelUsedGenerations from "@/components/model/ModelUsedGenerations";
import ModelFaqs from "@/components/model/ModelFaqs";
import ModelRelated from "@/components/model/ModelRelated";
import ModelCta from "@/components/model/ModelCta";
import modelPage from "@/data/modelPage.json";
import { getModelData } from "@/lib/model";

type Params = { brandSlug: string; modelSlug: string };

export function generateStaticParams() {
  return Object.values(modelPage).map((m) => ({ brandSlug: m.brandSlug, modelSlug: m.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const data = getModelData(params.modelSlug);
  if (!data || data.brandSlug !== params.brandSlug) return {};
  return {
    title: data.seo.title,
    description: data.seo.description,
    alternates: { canonical: `/${params.brandSlug}/${params.modelSlug}` },
  };
}

export default function ModelPage({ params }: { params: Params }) {
  const data = getModelData(params.modelSlug);
  if (!data || data.brandSlug !== params.brandSlug) notFound();

  return (
    <>
      <ModelThemeShell>
        <Header />
        <main>
          <ModelHero data={data.hero} trustBadges={data.hero.trustBadges} />
          <ModelFeatured data={data.featured} />
          <ModelEngineTable data={data.engineTable} />
          <ModelPriceGuide data={data.priceGuide} />
          <ModelUsedGenerations usedVsRecon={data.usedVsRecon} generations={data.generations} />
          <ModelFaqs data={data.faqs} />
          <ModelRelated data={data.related} />
          <ModelCta data={data.cta} />
        </main>
      </ModelThemeShell>
      <Footer />
    </>
  );
}
