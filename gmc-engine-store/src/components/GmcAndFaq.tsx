"use client";

import { useState } from "react";
import Icon from "./Icon";
import right from "@/data/isRightForYou.json";
import faqData from "@/data/faqs.json";

export default function GmcAndFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto  px-3 lg:px-0 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Is GMC the Right Stop */}
          <div className="rounded-xl border border-line bg-white p-4 lg:p-5 shadow-card h-full">
            <h2 className="text-lg lg:text-xl font-extrabold text-ink-900">{right.sectionTitle}</h2>
            <div className="mt-2.5 divide-y divide-line">
              {right.options.map((opt) => (
                <div key={opt.title} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid place-items-center w-10 h-10 rounded-full border-2 shrink-0 ${
                        opt.isPositive ? "border-primary-500 text-primary-600" : "border-amber-400 text-amber-500"
                      }`}
                    >
                      <Icon name={opt.isPositive ? "check" : "help"} className="w-5 h-5" />
                    </span>
                    <p className="text-[14px] font-bold text-ink-900 leading-tight">{opt.title}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[12px] font-medium text-ink-700 leading-tight">{opt.audience}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{opt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-xl border border-line bg-white p-4 lg:p-5 shadow-card h-full">
            <h2 className="text-lg lg:text-xl font-extrabold text-ink-900">{faqData.sectionTitle}</h2>
            <div className="mt-2.5 divide-y divide-line">
              {faqData.faqs.map((faq, idx) => {
                const open = openIdx === idx;
                return (
                  <div key={faq.question}>
                    <button
                      onClick={() => setOpenIdx(open ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 py-2.5 text-left"
                      aria-expanded={open}
                    >
                      <span className="text-[14px] font-semibold text-ink-900">{faq.question}</span>
                      <span className={`grid place-items-center w-6 h-6 rounded-full shrink-0 transition-colors ${open ? "bg-primary-600 text-white" : "text-ink-500"}`}>
                        <Icon name={open ? "minus" : "plus"} className="w-4 h-4" />
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-2.5" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <p className="text-[12px] leading-relaxed text-ink-500">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
