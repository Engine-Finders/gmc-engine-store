"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { HubPageData } from "@/lib/hub";

type Faqs = HubPageData["faqs"];
type Cta = HubPageData["cta"];

export default function HubFaqs({ faqs, cta }: { faqs: Faqs; cta: Cta }) {
  // closed by default, each one independent
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const toggle = (i: number) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <h2 className="text-[24px] font-bold tracking-tight text-ink-900 dark:text-white sm:text-[28px]">{faqs.title}</h2>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-[1.7] text-ink-600 dark:text-white/65">{faqs.subtitle}</p>

        {/* CSS columns, not a grid: each card then keeps its own height, so opening
            one answer never stretches the card beside it. */}
        <div className="mt-5 lg:columns-2 lg:gap-5 [&>*]:break-inside-avoid">
          {faqs.items.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div
                key={i}
                className="mb-3.5 overflow-hidden rounded-xl border border-line dark:border-white/10 bg-[#f7f9fc] dark:bg-white/[0.02] lg:mb-5"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left lg:p-5"
                >
                  <span className="flex min-w-0 items-start gap-2.5">
                    <span className="shrink-0 text-[14px] font-bold text-primary-600 dark:text-primary-400">Q:</span>
                    <span className="text-[14px] font-semibold leading-snug text-ink-900 dark:text-white lg:text-[15px]">{item.q}</span>
                  </span>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-primary-500 text-primary-600 transition-transform duration-300 dark:text-primary-400 ${isOpen ? "rotate-45" : ""}`}>
                    <Icon name="plus" className="h-3.5 w-3.5" />
                  </span>
                </button>

                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="flex gap-2.5 px-4 pb-4 text-[13px] leading-[1.85] text-ink-600 dark:text-white/70 lg:px-5 lg:pb-5 lg:text-[13.5px]">
                      <span className="shrink-0 font-bold text-primary-600 dark:text-primary-400">A:</span>
                      <span>{item.a}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= CTA ================= */}
        {/* Mobile: icon and text share a TOP ROW, button full-width beneath it.
            Desktop: all three in one row. The icon+text wrapper is what makes the
            mobile row work — as flat siblings the icon fell onto its own line. */}
        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-primary-500/70 bg-[#f4f8ff] dark:bg-primary-500/[0.06] p-5 shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_0_28px_-8px_rgba(59,130,246,0.55)] lg:flex-row lg:items-center lg:gap-8 lg:p-6">
          <div className="flex items-center gap-4 lg:flex-1 lg:gap-6">
            <span className="shrink-0 text-primary-600 dark:text-primary-400">
              <Icon name="clipboard" className="h-20 w-20 lg:h-[86px] lg:w-[86px]" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[20px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-[24px]">{cta.title}</p>
              <p className="mt-2 text-[13.5px] leading-[1.7] text-ink-600 dark:text-white/70">{cta.body}</p>
            </div>
          </div>

          <Link
            href={cta.buttonHref}
            className="inline-flex h-[46px] w-full shrink-0 items-center justify-center gap-2.5 rounded-xl bg-primary-600 px-6 text-[15px] font-bold text-white transition-colors hover:bg-primary-500 lg:w-auto"
          >
            <Icon name="search" className="h-5 w-5" />
            {cta.buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
