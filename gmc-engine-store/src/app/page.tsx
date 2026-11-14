import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FindEngineForVehicleSection from "@/components/FindEngineForVehicleSection";
import KnowYourEngineCodeSection from "@/components/KnowYourEngineCodeSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SupplierNetworkSection from "@/components/SupplierNetworkSection";
import BuyingEssentialsSection from "@/components/BuyingEssentialsSection";
import EngineBuyingFaqSection from "@/components/EngineBuyingFaqSection";
import Footer from "@/components/Footer";
import hero from "@/data/hero.json";
import { getHomepageDiscoveryData } from "@/lib/homepageDiscovery";
import { resolveHref } from "@/lib/links";
import CTA from "@/components/CTA";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  const discoveryData = getHomepageDiscoveryData();

  return (
    <>
      <Header />
      <main>
        <Hero
          cardHrefs={Object.fromEntries(
            hero.cards.map((c) => [c.code, resolveHref(c.href)]),
          )}
        />
        <FindEngineForVehicleSection data={discoveryData} />
        <KnowYourEngineCodeSection data={discoveryData} />
        <HowItWorksSection />
        <SupplierNetworkSection />
        <BuyingEssentialsSection />
        <EngineBuyingFaqSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
