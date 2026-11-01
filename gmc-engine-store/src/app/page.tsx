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

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BrowseByBrand />
        <FeaturedEngines />
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
