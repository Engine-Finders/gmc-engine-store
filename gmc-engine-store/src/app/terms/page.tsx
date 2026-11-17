import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms Of Use | Engined",
  description: "Terms for using the Engined platform to connect with engine suppliers.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f4f7fb] py-10 sm:py-14">
        <article className="mx-auto max-w-3xl rounded-2xl bg-white px-5 py-8 shadow-card sm:px-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="text-[12px] text-ink-500"><Link href="/" className="hover:text-primary-700">Home</Link><span className="mx-1.5">/</span><span>Terms Of Use</span></nav>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink-900">Terms Of Use</h1>
          <p className="mt-3 text-[13px] leading-6 text-ink-600">Engined is a third-party platform connecting buyers with engine suppliers. We do not sell engines, provide fitting or rebuilding services, or arbitrate disputes between buyers and suppliers.</p>
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">Supplier enquiries</h2>
          <p className="mt-2 text-[13px] leading-6 text-ink-600">Prices shown on Engined are indicative starting prices where provided. Compatibility, availability, final pricing, payment, warranty, delivery, returns and refunds must be confirmed and agreed directly with your chosen supplier.</p>
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">Your responsibility</h2>
          <p className="mt-2 text-[13px] leading-6 text-ink-600">Provide accurate vehicle and contact details, review the supplier’s specification and terms, and make any purchase or service agreement directly with the supplier. An enquiry submitted through Engined is not an order.</p>
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">Questions</h2>
          <p className="mt-2 text-[13px] leading-6 text-ink-600">If you need help using the platform, please <Link href="/contact" className="font-semibold text-primary-700 underline underline-offset-2">contact Engined</Link>.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
