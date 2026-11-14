import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import guides from "@/data/buyersGuides.json";

export const metadata: Metadata = {
  title: "Buying Guides | GMC Engine Store",
  description: "Straightforward guidance for buying a used or reconditioned engine with confidence.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f9fc]">
        <section className="navy-panel">
          <div className="mx-auto max-w-content px-3 py-10 lg:px-0 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-[12px] text-ink-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-white/80">Buying Guides</span>
            </nav>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.2em] text-primary-400">GMC advice</p>
            <h1 className="mt-2 text-[34px] font-extrabold tracking-tight text-white sm:text-[46px]">{guides.sectionTitle}</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-400 sm:text-[15px]">{guides.sectionDescription}</p>
          </div>
        </section>

        <section className="mx-auto max-w-content px-3 py-8 lg:px-0 lg:py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {guides.guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
              >
                <h2 className="text-[20px] font-extrabold text-ink-900 group-hover:text-primary-600">{guide.title}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-500">{guide.description}</p>
                <span className="mt-5 inline-flex text-[12px] font-bold text-primary-600">Read guide →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
