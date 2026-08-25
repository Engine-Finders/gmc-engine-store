"use client";

import { useState } from "react";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["faqs"];

export default function ModelFaqs({ data }: { data: Data }) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));
  const toggle = (i: number) => setOpen((p) => { const s = new Set(p); s.has(i) ? s.delete(i) : s.add(i); return s; });

  return (
    // band 6 (alt)
    <section className="bg-[#f7f9fc] dark:bg-[#0a1120] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-primary-300 dark:border-primary-400/40 text-primary-600 dark:text-primary-400"><Icon name="help" className="w-5 h-5" /></span>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-white">{data.title}</h2>
        </div>

        <div className="mt-6 space-y-3">
          {data.items.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div key={i} className="rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/[0.03]">
                <button onClick={() => toggle(i)} className="w-full flex items-start justify-between gap-3 p-5 text-left" aria-expanded={isOpen}>
                  <span className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-600 text-white text-[11px] font-bold">Q</span>
                    <span className="pt-1 text-[14px] font-bold text-ink-900 dark:text-white">{item.q}</span>
                  </span>
                  <Icon name={isOpen ? "chevron-up" : "chevron-down"} className="w-4 h-4 shrink-0 mt-1.5 text-ink-500 dark:text-white/60" />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="flex gap-3 px-5 pb-5 -mt-1">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-white/70 text-[11px] font-bold">A</span>
                      <p className="pt-1 text-[12.5px] leading-relaxed text-ink-600 dark:text-white/60">{item.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
