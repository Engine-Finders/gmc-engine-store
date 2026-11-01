import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BrowseByBrand from "@/components/BrowseByBrand";
import FeaturedEngines from "@/components/FeaturedEngines";
import HowItWorks from "@/components/HowItWorks";
import TrustStrip from "@/components/TrustStrip";
import ShopByBrand from "@/components/ShopByBrand";
import InfoCards from "@/components/InfoCards";
import PopularEngines from "@/components/PopularEngines";
import GmcAndFaq from "@/components/GmcAndFaq";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import hero from "@/data/hero.json";
import brands from "@/data/brands.json";
import engines from "@/data/engines.json";
import { resolveHref, resolveLinks } from "@/lib/links";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero cardHrefs={Object.fromEntries(hero.cards.map((c) => [c.code, resolveHref(c.href)]))} />
        <BrowseByBrand data={resolveLinks(brands)} />
        <FeaturedEngines data={resolveLinks(engines)} />
        <HowItWorks />
        <TrustStrip />
        <ShopByBrand />
        <InfoCards />
        <PopularEngines />
        <GmcAndFaq />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
