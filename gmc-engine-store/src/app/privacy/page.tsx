import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Engined",
  description: "How Engined uses enquiry details to match buyers with suitable engine suppliers.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f4f7fb] py-10 sm:py-14">
        <article className="mx-auto max-w-3xl rounded-2xl bg-white px-5 py-8 shadow-card sm:px-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="text-[12px] text-ink-500"><Link href="/" className="hover:text-primary-700">Home</Link><span className="mx-1.5">/</span><span>Privacy Policy</span></nav>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink-900">Privacy Policy</h1>
          <p className="mt-3 text-[13px] leading-6 text-ink-600">Engined uses the details you provide to understand your vehicle and engine requirements and to share your enquiry with a small number of suitable suppliers who may contact you.</p>
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">What we collect</h2>
          <p className="mt-2 text-[13px] leading-6 text-ink-600">Depending on the enquiry, this can include your name, email address, phone number, postcode, vehicle registration, vehicle details and the service you need.</p>
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">How information is shared</h2>
          <p className="mt-2 text-[13px] leading-6 text-ink-600">We share enquiry details with suitable suppliers selected for the request. Those suppliers confirm compatibility, availability, pricing and their own purchase or service terms directly with you.</p>
          <h2 className="mt-8 text-xl font-extrabold text-ink-900">Your choices</h2>
          <p className="mt-2 text-[13px] leading-6 text-ink-600">For questions about an enquiry or your personal information, please <Link href="/contact" className="font-semibold text-primary-700 underline underline-offset-2">contact Engined</Link>. Supplier terms and platform terms do not remove your statutory rights.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
