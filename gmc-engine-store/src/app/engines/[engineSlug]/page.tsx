import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelThemeShell from "@/components/model/ModelThemeShell";
import HubHero from "@/components/hub/HubHero";
import HubApplications from "@/components/hub/HubApplications";
import HubTables from "@/components/hub/HubTables";
import HubWhatYouGet from "@/components/hub/HubWhatYouGet";
import HubFaqs from "@/components/hub/HubFaqs";
import { getHubData, hubSlugs } from "@/lib/hub";

type Params = { engineSlug: string };

export function generateStaticParams() {
  return hubSlugs.map((engineSlug) => ({ engineSlug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const data = getHubData(params.engineSlug);
  if (!data) return {};
  return {
    title: data.seo.title,
    description: data.seo.description,
    alternates: { canonical: data.seo.canonical },
  };
}

export default function EngineHubPage({ params }: { params: Params }) {
  const data = getHubData(params.engineSlug);
  if (!data) notFound();

  return (
    <>
      <ModelThemeShell>
        <Header />
        <main>
          <HubHero data={data} />
          <HubApplications data={data.applications} />
          <HubTables compatibility={data.compatibility} prices={data.prices} />
          <HubWhatYouGet data={data.whatYouGet} />
          <HubFaqs faqs={data.faqs} cta={data.cta} />
        </main>
      </ModelThemeShell>
      <Footer />
    </>
  );
}
