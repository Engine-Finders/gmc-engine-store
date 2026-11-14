"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

const faqs = [
  {
    id: "faq-sell-directly",
    question: "Does Engined Sell Engines Directly?",
    answer: "No. Engined connects buyers with UK suppliers. You arrange your purchase or service directly with your chosen supplier.",
  },
  {
    id: "faq-listing-prices",
    question: "Are Listing Prices The Final Price?",
    answer: "No. Prices are indicative starting prices. Your supplier confirms the final quote for the engine specification, availability and service you require.",
  },
  {
    id: "faq-match",
    question: "How Do You Match Me With Suppliers?",
    answer: "We use your vehicle and engine requirements first, then prioritise nearby suppliers using your postcode. Nationwide suppliers may be included where needed. Your enquiry is shared with a small number of suitable suppliers.",
  },
  {
    id: "faq-verified-supplier",
    question: "What Does A Verified Supplier Mean?",
    answer: "Our supplier checks cover UK company registration through Companies House and a physical business address. They do not constitute a guarantee of individual engines or services.",
  },
  {
    id: "faq-fitting-rebuild",
    question: "Can I Request Fitting Or A Rebuild Instead?",
    answer: "Yes. Tell us whether you need supply-only, a replacement engine supplied and fitted, or a rebuild of your existing engine. Available services depend on the supplier.",
  },
  {
    id: "faq-problems-order",
    question: "Who Handles Warranties, Refunds Or Problems With The Order?",
    answer: "Your chosen supplier sets the applicable terms and handles the engine purchase or service. Contact them directly about warranties, delivery, returns, refunds or disputes. Engined does not arbitrate these matters.",
  },
];

export default function EngineBuyingFaqSection() {
  const [openId, setOpenId] = useState(faqs[0].id);

  useEffect(() => {
    const openFromHash = () => {
      const target = faqs.find((faq) => faq.id === window.location.hash.slice(1));
      if (!target) return;
      setOpenId(target.id);
      window.setTimeout(() => document.getElementById(target.id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="engine-faq-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-0">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:gap-10">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-primary-500 text-primary-600"><Icon name="chat" className="h-6 w-6" /></span>
            <h2 id="engine-faq-heading" className="mt-3 max-w-sm text-[24px] font-extrabold leading-[1.06] tracking-tight text-ink-900 sm:text-[30px]">Questions About Buying A Replacement Engine</h2>
            <p className="mt-3 max-w-sm text-[13px] leading-5 text-ink-600">Understand the listing, the quote and who you buy from.</p>
          </div>

          <div className="border-t border-line">
            {faqs.map((faq) => {
              const open = openId === faq.id;
              const buttonId = `${faq.id}-button`;
              const panelId = `${faq.id}-panel`;
              return (
                <div id={faq.id} key={faq.id} className="scroll-mt-24 border-b border-line">
                  <button id={buttonId} type="button" onClick={() => setOpenId(open ? "" : faq.id)} aria-expanded={open} aria-controls={panelId} className="flex min-h-[48px] w-full items-center justify-between gap-5 py-3 text-left text-[14px] font-extrabold leading-5 text-ink-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:text-[15px]">
                    <span>{faq.question}</span>
                    <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center text-[22px] font-normal leading-none text-primary-600">{open ? "−" : "+"}</span>
                  </button>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className="pb-3 pr-10 text-[13px] leading-5 text-ink-700">
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
