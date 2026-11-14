import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import hubPage from "@/data/hubPage.json";

export const metadata: Metadata = {
  title: "All Engine Families | GMC Engine Store",
  description: "Browse GMC engine hubs by engine code and find compatible used or reconditioned units.",
  alternates: { canonical: "/engines" },
};

export default function EnginesPage() {
  const hubs = Object.entries(hubPage).sort(([, a], [, b]) => {
    const left = `${a.hero.brand} ${a.engineSlug}`;
    const right = `${b.hero.brand} ${b.engineSlug}`;
    return left.localeCompare(right);
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f9fc]">
        <section className="navy-panel">
          <div className="mx-auto max-w-content px-3 py-10 lg:px-0 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-[12px] text-ink-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-white/80">Engines</span>
            </nav>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.2em] text-primary-400">Engine catalogue</p>
            <h1 className="mt-2 text-[34px] font-extrabold tracking-tight text-white sm:text-[46px]">All Engine Families</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-400 sm:text-[15px]">
              Choose an engine family to see compatible vehicles, available units and fitment guidance.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-content px-3 py-8 lg:px-0 lg:py-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hubs.map(([slug, page]) => (
              <Link
                key={slug}
                href={`/engines/${slug}`}
                className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-600">{page.hero.brand}</p>
                <h2 className="mt-2 text-[19px] font-extrabold text-ink-900 group-hover:text-primary-600">{slug.toUpperCase()}</h2>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-500">{page.hero.description}</p>
                <span className="mt-4 inline-flex text-[12px] font-bold text-primary-600">View engine hub →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
