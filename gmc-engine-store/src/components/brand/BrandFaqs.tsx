"use client";

import { useState } from "react";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["faqs"];

export default function BrandFaqs({ data }: { data: Data }) {
  // All collapsed by default, on every breakpoint. Each panel toggles on its own —
  // there is no viewport-driven reset, which previously reopened everything on
  // desktop and clobbered whatever the user had closed.
  const [open, setOpen] = useState<Set<number>>(() => new Set());

  const toggle = (i: number) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[22px] sm:text-[28px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
        <p className="mt-1 text-[13px] text-ink-500">{data.subtitle}</p>

        {/* items-start + self-start: grid cells stretch to the row height by default,
            so expanding one panel dragged its row-neighbour open too. */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {data.items.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div key={i} className={`self-start rounded-xl border bg-white transition-all ${isOpen ? "border-primary-200 border-l-[3px] border-l-primary-600 shadow-card" : "border-line"}`}>
                <button onClick={() => toggle(i)} className="w-full flex items-start justify-between gap-3 p-4 lg:p-5 text-left" aria-expanded={isOpen}>
                  <span className="flex items-start gap-3">
                    <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-primary-600 text-white text-[11px] font-bold">Q{i + 1}</span>
                    <span className="pt-0.5 text-[14px] font-bold text-ink-900">{item.q}</span>
                  </span>
                  <Icon name={isOpen ? "minus" : "plus"} className="w-5 h-5 shrink-0 mt-1 text-primary-600" />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="flex gap-3 px-4 lg:px-5 pb-5 -mt-1">
                      <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-primary-50 text-primary-600 text-[11px] font-bold">A</span>
                      <p className="pt-0.5 text-[12.5px] leading-relaxed text-ink-500">{item.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why buy */}
        <div className="mt-12 text-center">
          <h3 className="text-[18px] sm:text-[20px] font-extrabold text-ink-900">{data.whyBuy.title}</h3>
          <span className="mt-2 mx-auto block h-0.5 w-10 rounded bg-primary-500" />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-line divide-y sm:divide-y-0 sm:divide-x divide-line">
          {data.whyBuy.items.map((w) => (
            <div key={w.title} className="p-5">
              <div className="flex items-center gap-2.5">
                <span className="text-primary-600 shrink-0">
                  <Icon name={w.icon} className="w-6 h-6" />
                </span>
                <p className="text-[13.5px] font-bold text-ink-900 leading-tight">{w.title}</p>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-snug text-ink-500">{w.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
