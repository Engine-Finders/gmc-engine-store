import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandHero from "@/components/BrandHero";
import BrandHowItWorks from "@/components/brand/BrandHowItWorks";
import BrandFeaturedEngines from "@/components/brand/BrandFeaturedEngines";
import BrandShopByModel from "@/components/brand/BrandShopByModel";
import BrandEngineFamilies from "@/components/brand/BrandEngineFamilies";
import BrandPriceGuide from "@/components/brand/BrandPriceGuide";
import BrandUsedVsRecon from "@/components/brand/BrandUsedVsRecon";
import BrandAbout from "@/components/brand/BrandAbout";
import BrandWarrantyDelivery from "@/components/brand/BrandWarrantyDelivery";
import BrandFaqs from "@/components/brand/BrandFaqs";
import BrandCta from "@/components/brand/BrandCta";
import BrandWhyUse from "@/components/brand/BrandWhyUse";
import { brandSlugs, getBrandData } from "@/lib/brand";

export function generateStaticParams() {
  return brandSlugs.map((brandSlug) => ({ brandSlug }));
}

export function generateMetadata({ params }: { params: { brandSlug: string } }): Metadata {
  const data = getBrandData(params.brandSlug);
  if (!data) return {};
  return { title: data.seo.title, description: data.seo.description, alternates: { canonical: `/${params.brandSlug}` } };
}

export default function BrandPage({ params }: { params: { brandSlug: string } }) {
  const data = getBrandData(params.brandSlug);
  if (!data) notFound();

  return (
    <>
      <Header />
      <main>
        <BrandHero data={data.hero} carImages={data.shopByModel.models.slice(0, 5).map((model) => model.image)} />
        <BrandShopByModel data={data.shopByModel} brand={data.hero.brand} />
        <BrandFeaturedEngines data={data.featuredEngines} brand={data.hero.brand} brandSlug={params.brandSlug} />
        <BrandEngineFamilies data={data.engineFamilies} brand={data.hero.brand} brandSlug={params.brandSlug} />
        <BrandHowItWorks data={data.howItWorks} brand={data.hero.brand} />
        <BrandPriceGuide data={data.priceGuide} brand={data.hero.brand} />
        <BrandUsedVsRecon data={data.usedVsRecon} brand={data.hero.brand} />
        <BrandAbout data={data.about} brand={data.hero.brand} />
        <BrandWarrantyDelivery data={data.warrantyDelivery} brand={data.hero.brand} />
        <BrandFaqs data={data.faqs} brand={data.hero.brand} />
        <BrandWhyUse brand={data.hero.brand} />
        <BrandCta data={data.cta} brand={data.hero.brand} />
      </main>
      <Footer />
    </>
  );
}
