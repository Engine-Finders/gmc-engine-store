import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelThemeShell from "@/components/model/ModelThemeShell";
import ListingHero from "@/components/listing/ListingHero";
import ListingAbout from "@/components/listing/ListingAbout";
import ListingCompatible from "@/components/listing/ListingCompatible";
import ListingInfoCards from "@/components/listing/ListingInfoCards";
import ListingFaqs from "@/components/listing/ListingFaqs";
import ListingCta from "@/components/listing/ListingCta";
import { getListingData, listingParams } from "@/lib/listing";

type Params = { engineSlug: string; applicationSlug: string };

// ~5,800 extracted listings: only the hand-built page is pre-rendered at build time; every
// other listing renders on its first request and is cached after that (building all of them
// in one `next build` takes far too long).
export const dynamicParams = true;

export function generateStaticParams() {
  return listingParams().filter((p) => p.engineSlug === "om651");
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const data = getListingData(params.engineSlug, params.applicationSlug);
  if (!data) return {};
  return {
    title: data.seo.title,
    description: data.seo.description,
    alternates: { canonical: `/engines/${params.engineSlug}/${params.applicationSlug}` },
  };
}

export default function ListingPage({ params }: { params: Params }) {
  const data = getListingData(params.engineSlug, params.applicationSlug);
  if (!data) notFound();

  return (
    <>
      <ModelThemeShell>
        <Header />
        <main>
          <ListingHero data={data} />
          <ListingAbout data={data} />
          <ListingCompatible data={data.compatible} />
          <ListingInfoCards data={data} />
          {data.cta && <ListingCta data={data.cta} />}
          {data.faqs && <ListingFaqs data={data.faqs} />}
        </main>
      </ModelThemeShell>
      <Footer />
    </>
  );
}
