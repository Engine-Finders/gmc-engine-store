"use client";

import { useState } from "react";
import Icon from "../Icon";
import type { ListingPageData } from "@/lib/listing";

type Data = NonNullable<ListingPageData["faqs"]>;

export default function ListingFaqs({ data }: { data: Data }) {
  // reference shows the first answer expanded, the rest collapsed
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const toggle = (i: number) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-primary-500 text-primary-600 dark:text-primary-400">
            <Icon name="question" className="h-5 w-5" />
          </span>
          <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-ink-900 dark:text-white">{data.title}</h2>
        </div>

        {/* one bordered panel, rows divided — matches the reference */}
        <div className="mt-5 overflow-hidden rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/[0.02] divide-y divide-line dark:divide-white/8">
          {data.items.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left lg:px-6 lg:py-5"
                >
                  <span className="text-[14px] lg:text-[15px] font-semibold leading-snug text-ink-900 dark:text-white">{item.q}</span>
                  <Icon
                    name="chevron-down"
                    className={`mt-0.5 h-5 w-5 shrink-0 text-ink-500 dark:text-white/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[13px] lg:text-[13.5px] leading-[1.85] text-ink-600 dark:text-white/70 lg:px-6">
                      {item.a}
                    </p>
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
