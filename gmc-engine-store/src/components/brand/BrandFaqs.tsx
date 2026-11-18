"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["faqs"];

function questions(brand: string) {
  return [
    { q: `Does Engined sell ${brand} engines directly?`, a: "No. Engined connects buyers with UK engine suppliers. You arrange your purchase or service directly with your chosen supplier." },
    { q: `Can I request used and reconditioned ${brand} engines?`, a: `Yes. You can enquire about used or reconditioned ${brand} engines where suitable suppliers offer them. Confirm the engine condition, included components and any reconditioning work with the supplier.` },
    { q: "How is the correct engine specification confirmed?", a: "Enter your vehicle registration or share the vehicle model, year and engine details. Your supplier confirms the exact application, engine code and fitment before quoting." },
    { q: "Are the displayed prices final quotes?", a: "No. Displayed prices are indicative starting prices or listing prices. The chosen supplier confirms compatibility, availability, delivery, fitting and the final quote." },
    { q: "Can I request supply and fit or an engine rebuild?", a: "Yes. Tell us whether you need supply only, supply and fit, or a rebuild enquiry. Any workshop work and service terms are arranged directly with the chosen supplier." },
    { q: "Who handles warranties, delivery and refunds?", a: "The supplier you choose sets and handles the warranty, delivery, return and refund terms. Confirm those terms before purchasing or authorising work." },
  ];
}

export default function BrandFaqs({ data, brand }: { data: Data; brand: string }) {
  const items = questions(brand);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-5 sm:py-6">
      <div className="mx-auto grid max-w-content gap-7 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.6fr] lg:gap-10 lg:px-8">
        <div>
          <h2 className="text-[25px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[30px]">{brand} engine buying FAQs</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-500">Practical answers before you request supplier quotes.</p>
          <Link href="#supplier-quote" className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-primary-700 hover:text-primary-600"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-primary-600"><Icon name="chat" className="h-4 w-4" /></span>Get engine quotes <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>
        <div>
          <div className="space-y-2">
            {items.map((item, index) => {
              const isOpen = open === index;
              const panelId = `brand-faq-panel-${index}`;
              return <div key={item.q} className={`overflow-hidden rounded-lg border transition ${isOpen ? "border-primary-200 bg-primary-50" : "border-line bg-white"}`}><h3><button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : index)} className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"><span className="text-[13px] font-bold leading-snug text-ink-900">{item.q}</span><Icon name={isOpen ? "minus" : "plus"} className="h-5 w-5 shrink-0 text-primary-600" /></button></h3><div id={panelId} hidden={!isOpen} className="px-4 pb-4 text-[12.5px] leading-relaxed text-ink-600">{item.a}</div></div>;
            })}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary-50 px-4 py-3 text-[11.5px] leading-relaxed text-ink-700"><Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />Supplier checks cover Companies House registration and a physical business address. They do not guarantee engine condition or service quality.</div>
        </div>
      </div>
    </section>
  );
}
