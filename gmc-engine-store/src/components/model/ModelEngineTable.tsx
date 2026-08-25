"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["engineTable"];

export default function ModelEngineTable({ data }: { data: Data }) {
  const [gen, setGen] = useState(data.generations[0]);
  const rows = gen === data.generations[0] ? data.rows : data.rows.filter((r) => r.gen === gen);

  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="max-w-lg">
            <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-white">{data.title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500 dark:text-white/55">{data.subtitle}</p>
          </div>
          {/* generation tabs — snap h-scroll on mobile so they never wrap */}
          {/* -my-1/py-1 gives the scroller vertical room so button borders and focus
              rings aren't clipped, without adding outer spacing */}
          <div className="-mx-4 -my-1 flex gap-2 overflow-x-auto px-4 py-1 snap-x no-scrollbar sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0">
            {data.generations.map((g) => (
              <button
                key={g}
                onClick={() => setGen(g)}
                className={`shrink-0 snap-start whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-bold transition-colors ${
                  gen === g ? "bg-primary-600 text-white" : "border border-line dark:border-white/15 text-ink-700 dark:text-white/80 hover:border-primary-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* MOBILE — the 7-column table can't work at 390px, so the same rows render as
            cards inside a capped in-section scroll (brand-page pattern) rather than
            forcing a sideways drag through ~50 rows. */}
        <div className="mt-6 lg:hidden">
          <div className="no-scrollbar max-h-[520px] space-y-2.5 overflow-y-auto pr-1">
            {rows.map((r, i) => (
              <div key={i} className="rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/[0.04] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-ink-900 dark:text-white leading-snug">{r.variant}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500 dark:text-white/55">
                      {r.code} · {r.years}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink-400/15 dark:bg-white/10 px-2 py-1 text-[11px] font-semibold text-ink-700 dark:text-white/75">
                    <span className={`h-1.5 w-1.5 rounded-full ${r.fuel === "Diesel" ? "bg-green-500" : "bg-orange-400"}`} /> {r.fuel}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line dark:border-white/10 pt-2.5">
                  <span className="text-[12px] text-ink-700 dark:text-white/70">{r.output}</span>
                  <Link href={r.href || "#"} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-primary-600 dark:text-primary-400">
                    View engine <Icon name="arrow-right" className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-500 dark:text-white/40">{rows.length} engines — scroll for more</p>
        </div>

        <div className="mt-6 hidden lg:block overflow-x-auto rounded-xl border border-line dark:border-white/10">
          <table className="w-full min-w-[820px] text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f8fb] dark:bg-white/[0.04]">
                {data.columns.map((c) => (
                  <th key={c} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-ink-500 dark:text-white/55 whitespace-nowrap">{c}</th>
                ))}
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-ink-500 dark:text-white/55 whitespace-nowrap">View Engine</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-line dark:border-white/8 hover:bg-[#fafbfd] dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 text-[13px] font-bold text-ink-900 dark:text-white whitespace-nowrap">{r.variant}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-700 dark:text-white/70 whitespace-nowrap">{r.code}</td>
                  <td className="px-5 py-3.5 text-[13px] whitespace-nowrap">
                    {r.href ? (
                      <Link href={r.href} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">{r.page}</Link>
                    ) : (
                      <span className="text-ink-400 dark:text-white/40">{r.page}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-700 dark:text-white/70 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${r.fuel === "Diesel" ? "bg-green-500" : "bg-orange-400"}`} /> {r.fuel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-700 dark:text-white/70 whitespace-nowrap">{r.years}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-700 dark:text-white/70 whitespace-nowrap">{r.output}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Link href={r.href || "#"} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                      View engine <Icon name="arrow-right" className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6">
          <Link href={data.viewAllHref} className="inline-flex items-center gap-2 rounded-lg border border-line dark:border-white/15 bg-white dark:bg-white/[0.04] px-5 py-3 text-[13px] font-bold text-primary-600 dark:text-primary-400 shadow-card hover:border-primary-300">
            {data.viewAllText} <Icon name="arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
