"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["engineTable"];

export default function ModelEngineTable({ data }: { data: Data }) {
  const [gen, setGen] = useState(data.generations[0]);
  const rows = gen === data.generations[0] ? data.rows : data.rows.filter((row) => row.gen === gen);

  return (
    <section className="bg-[#f4f7fb] py-5 dark:bg-[#0a1120] sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-[28px]">{data.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500 dark:text-white/60">{data.subtitle}</p>
          </div>
          <div className="-mx-4 -my-1 flex snap-x gap-2 overflow-x-auto px-4 py-1 no-scrollbar sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0">
            {data.generations.map((generation) => (
              <button key={generation} type="button" onClick={() => setGen(generation)} className={`shrink-0 snap-start whitespace-nowrap rounded-lg px-4 py-2 text-[12px] font-bold transition-colors sm:text-[13px] ${gen === generation ? "bg-navy-900 text-white dark:bg-primary-600" : "border border-line bg-white text-ink-700 hover:border-primary-300 hover:text-primary-700 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/80"}`}>
                {generation}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-line dark:border-white/10 sm:mt-6">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-navy-900 text-white shadow-[0_2px_0_rgba(11,18,38,0.18)]">
              <tr>
                {data.columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 text-[11px] font-bold sm:text-[12px]">{column}</th>)}
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold sm:text-[12px]">View Engine</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={index % 2 ? "bg-[#f5f7fb] dark:bg-white/[0.035]" : "bg-white dark:bg-white/[0.015]"}>
                  <td className="border-t border-line px-4 py-2.5 text-[12.5px] font-extrabold text-ink-900 dark:border-white/10 dark:text-white">{row.variant}</td>
                  <td className="border-t border-line px-4 py-2.5 text-[12.5px] text-ink-700 dark:border-white/10 dark:text-white/75">{row.code}</td>
                  <td className="border-t border-line px-4 py-2.5 text-[12.5px] dark:border-white/10">
                    {row.href ? <Link href={row.href} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">{row.page}</Link> : <span className="text-ink-400 dark:text-white/40">{row.page}</span>}
                  </td>
                  <td className="border-t border-line px-4 py-2.5 text-[12.5px] text-ink-700 dark:border-white/10 dark:text-white/75"><span className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${row.fuel === "Diesel" ? "bg-green-500" : "bg-orange-400"}`} />{row.fuel}</span></td>
                  <td className="whitespace-nowrap border-t border-line px-4 py-2.5 text-[12.5px] text-ink-700 dark:border-white/10 dark:text-white/75">{row.years}</td>
                  <td className="whitespace-nowrap border-t border-line px-4 py-2.5 text-[12.5px] text-ink-700 dark:border-white/10 dark:text-white/75">{row.output}</td>
                  <td className="whitespace-nowrap border-t border-line px-4 py-2.5 dark:border-white/10">
                    <Link href={row.href || "#"} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary-600 hover:underline dark:text-primary-400">View engine <Icon name="arrow-right" className="h-3.5 w-3.5" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-500 dark:text-white/40">{rows.length} engines — scroll for more</p>

        <div className="mt-3 flex justify-center sm:mt-4">
          <Link href={data.viewAllHref} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-[13px] font-bold text-primary-700 shadow-card transition hover:border-primary-300 dark:border-white/15 dark:bg-white/[0.04] dark:text-primary-400">
            {data.viewAllText} <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
