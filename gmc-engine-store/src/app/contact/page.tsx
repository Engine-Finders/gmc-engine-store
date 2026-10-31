import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import QuoteForm from "@/components/quote/QuoteForm";
import data from "@/data/contact.json";

export const metadata: Metadata = {
  title: data.seo.title,
  description: data.seo.description,
  alternates: { canonical: data.seo.path },
};

type Detail = { icon: string; label: string; value: string; href?: string };

/** Only the contact details that have been filled in contact.json are shown. */
function detailRows(): Detail[] {
  const d = data.details;
  const rows: Detail[] = [];
  if (d.phone) rows.push({ icon: "phone", label: "Call us", value: d.phone, href: `tel:${d.phone.replace(/[^\d+]/g, "")}` });
  if (d.whatsapp) rows.push({ icon: "phone", label: "WhatsApp", value: d.whatsapp, href: `https://wa.me/${d.whatsapp.replace(/\D/g, "")}` });
  if (d.email) rows.push({ icon: "mail", label: "Email", value: d.email, href: `mailto:${d.email}` });
  if (d.address) rows.push({ icon: "pin", label: "Address", value: d.address });
  if (d.hours) rows.push({ icon: "clock", label: "Opening hours", value: d.hours });
  return rows;
}

export default function ContactPage() {
  const rows = detailRows();
  return (
    <>
      <Header />
      <main>
        {/* hero band */}
        <section className="navy-panel relative overflow-hidden">
          <div className="hero-dots absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-content px-3 py-9 lg:px-0 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-[12px] text-ink-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-white/80">Contact</span>
            </nav>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.2em] text-primary-400">{data.hero.kicker}</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[40px] lg:text-[48px]">
              {data.hero.title} <span className="text-primary-500">{data.hero.highlight}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-400 sm:text-[15px]">{data.hero.description}</p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {data.reasons.map((r) => (
                <li key={r.title} className="inline-flex items-center gap-2 text-[13px] font-medium text-white/80">
                  <Icon name={r.icon} className="h-5 w-5 text-primary-400" />
                  {r.title}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* form + side cards */}
        <section className="bg-[#f7f9fc] py-8 lg:py-12">
          <div className="mx-auto grid max-w-content grid-cols-1 gap-5 px-3 lg:grid-cols-[1.25fr_1fr] lg:gap-6 lg:px-0">
            <div id="enquiry-form" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
              <h2 className="text-[22px] font-extrabold tracking-tight text-ink-900">{data.form.title}</h2>
              <p className="mb-4 mt-1 text-[13px] text-ink-600">{data.form.description}</p>
              <QuoteForm source="contact-page" idPrefix="contact" />
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
                <h2 className="text-[18px] font-bold text-ink-900">{data.steps.title}</h2>
                <ol className="mt-4 space-y-4">
                  {data.steps.items.map((s, i) => (
                    <li key={s.title} className="flex items-start gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-primary-200 bg-primary-50 text-primary-600">
                        <Icon name={s.icon} className="h-[26px] w-[26px]" />
                      </span>
                      <div>
                        <p className="text-[14px] font-bold leading-snug text-ink-900">{i + 1}. {s.title}</p>
                        <p className="mt-1 text-[12.5px] leading-snug text-ink-500">{s.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {rows.length > 0 && (
                <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
                  <h2 className="text-[18px] font-bold text-ink-900">{data.details.title}</h2>
                  <ul className="mt-4 space-y-3.5">
                    {rows.map((r) => (
                      <li key={r.label} className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary-200 bg-primary-50 text-primary-600">
                          <Icon name={r.icon} className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-500">{r.label}</p>
                          {r.href ? (
                            <a href={r.href} className="break-words text-[14px] font-bold text-ink-900 hover:text-primary-600">{r.value}</a>
                          ) : (
                            <p className="text-[14px] font-bold text-ink-900">{r.value}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {data.reasons.map((r) => (
                  <div key={r.title} className="rounded-xl border border-line bg-white px-2 py-4 text-center shadow-card">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-primary-200 bg-primary-50 text-primary-600">
                      <Icon name={r.icon} className="h-[26px] w-[26px]" />
                    </span>
                    <p className="mt-2 text-[12.5px] font-bold leading-tight text-ink-900">{r.title}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-ink-500">{r.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
