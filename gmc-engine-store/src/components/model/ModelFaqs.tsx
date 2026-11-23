"use client";

import { useState } from "react";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["faqs"];

export default function ModelFaqs({ data }: { data: Data }) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));
  const toggle = (index: number) => setOpen((previous) => { const next = new Set(previous); next.has(index) ? next.delete(index) : next.add(index); return next; });

  return (
    <section className="bg-white py-5 dark:bg-[#070c18] sm:py-6">
      <div className="mx-auto grid max-w-content gap-7 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.6fr] lg:gap-10 lg:px-8">
        <div>
          <h2 className="text-[25px] font-extrabold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-[30px]">{data.title}</h2>
        </div>
        <div>
          <div className="space-y-2">
            {data.items.map((item, index) => {
              const isOpen = open.has(index);
              const panelId = `model-faq-panel-${index}`;
              return (
                <div key={item.q} className={`overflow-hidden rounded-lg border transition ${isOpen ? "border-primary-200 bg-primary-50 dark:border-primary-400/30 dark:bg-primary-500/10" : "border-line bg-white dark:border-white/10 dark:bg-white/[0.03]"}`}>
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(index)} className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset">
                      <span className="text-[13px] font-bold leading-snug text-ink-900 dark:text-white">{item.q}</span>
                      <Icon name={isOpen ? "minus" : "plus"} className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                    </button>
                  </h3>
                  <div id={panelId} aria-hidden={!isOpen} className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-[12.5px] leading-relaxed text-ink-600 dark:text-white/60">{item.a}</p>
                    </div>
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
