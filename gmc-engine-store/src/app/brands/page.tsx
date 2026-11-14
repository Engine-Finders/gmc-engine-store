import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import brandPage from "@/data/brandPage.json";

export const metadata: Metadata = {
  title: "All Engine Brands | GMC Engine Store",
  description: "Browse GMC's available used and reconditioned engine pages by vehicle brand.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  const brands = Object.entries(brandPage).sort(([, a], [, b]) => a.hero.name.localeCompare(b.hero.name));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f9fc]">
        <section className="navy-panel">
          <div className="mx-auto max-w-content px-3 py-10 lg:px-0 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-[12px] text-ink-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-white/80">Brands</span>
            </nav>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.2em] text-primary-400">Browse by manufacturer</p>
            <h1 className="mt-2 text-[34px] font-extrabold tracking-tight text-white sm:text-[46px]">All Engine Brands</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-400 sm:text-[15px]">
              Explore available engine families, vehicle models and current fitment guidance by brand.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-content px-3 py-8 lg:px-0 lg:py-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map(([slug, page]) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.hero.logo} alt={`${page.hero.name} logo`} className="h-12 w-16 object-contain" />
                  <div className="min-w-0">
                    <h2 className="text-[17px] font-extrabold text-ink-900 group-hover:text-primary-600">{page.hero.name}</h2>
                    <p className="mt-1 text-[12px] font-semibold text-primary-600">Browse engines</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-ink-500">{page.hero.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
