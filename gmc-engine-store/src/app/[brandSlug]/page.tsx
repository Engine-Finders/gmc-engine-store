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
        <BrandHero data={data.hero} />
        <BrandHowItWorks data={data.howItWorks} />
        <BrandFeaturedEngines data={data.featuredEngines} />
        <BrandShopByModel data={data.shopByModel} />
        <BrandEngineFamilies data={data.engineFamilies} />
        <BrandPriceGuide data={data.priceGuide} />
        <BrandUsedVsRecon data={data.usedVsRecon} />
        <BrandAbout data={data.about} />
        <BrandWarrantyDelivery data={data.warrantyDelivery} />
        <BrandFaqs data={data.faqs} />
        <BrandCta data={data.cta} />
      </main>
      <Footer />
    </>
  );
}
