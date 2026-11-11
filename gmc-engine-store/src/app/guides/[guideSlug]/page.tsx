import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import guides from "@/data/buyersGuides.json";

type Params = { guideSlug: string };

function getGuide(slug: string) {
  return guides.guides.find((guide) => guide.href.split("/").filter(Boolean).pop() === slug);
}

export function generateStaticParams() {
  return guides.guides.map((guide) => ({ guideSlug: guide.href.split("/").filter(Boolean).pop()! }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const guide = getGuide(params.guideSlug);
  if (!guide) return {};
  return {
    title: `${guide.title} | GMC Engine Store`,
    description: guide.description,
    alternates: { canonical: `/guides/${params.guideSlug}` },
  };
}

export default function GuidePage({ params }: { params: Params }) {
  const guide = getGuide(params.guideSlug);
  if (!guide) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f9fc]">
        <section className="navy-panel">
          <div className="mx-auto max-w-content px-3 py-10 lg:px-0 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-[12px] text-ink-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5 opacity-50">/</span>
              <Link href="/guides" className="hover:text-white">Buying Guides</Link>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-white/80">{guide.title}</span>
            </nav>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.2em] text-primary-400">Buying guide</p>
            <h1 className="mt-2 max-w-3xl text-[34px] font-extrabold tracking-tight text-white sm:text-[46px]">{guide.title}</h1>
          </div>
        </section>

        <section className="mx-auto max-w-content px-3 py-8 lg:px-0 lg:py-12">
          <article className="max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
            <p className="text-[16px] leading-relaxed text-ink-700">{guide.description}</p>
            <div className="mt-8 rounded-xl border border-primary-100 bg-primary-50 p-5">
              <h2 className="text-[17px] font-extrabold text-ink-900">Need help with a specific engine?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">Send us your registration or engine code and our team can confirm the right route for your vehicle.</p>
              <Link href="/contact" className="mt-4 inline-flex rounded-lg bg-primary-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-primary-500">Contact GMC</Link>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
