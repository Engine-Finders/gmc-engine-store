"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["featured"];

export default function ModelFeatured({ data }: { data: Data }) {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setFavs((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    // this section stays light in both themes — deliberately no `dark:` variants
    // band 2 (alt). Light-only by design, so no dark: variant here either.
    <section className="bg-[#f7f9fc] py-6 lg:py-7">
      {/* full-bleed: no max-w-content, so the 8-up row runs edge to edge */}
      <div className="w-full px-4 sm:px-6 lg:px-6 2xl:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
            <p className="mt-1 text-[13px] text-ink-500 max-w-3xl">{data.subtitle}</p>
          </div>
          <Link href={data.viewAllHref} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-600 whitespace-nowrap">
            {data.viewAllText}
            <Icon name="arrow-right" className="w-4 h-4" />
          </Link>
        </div>

        {/* horizontal scroller; from lg the cards are sized so exactly 8 fill the width */}
        <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-2 lg:gap-2.5 xl:gap-3">
          {data.engines.map((e) => {
            const recon = e.condition === "Reconditioned";
            return (
              // 8 cards + 7 gaps span the full width; the rest scroll into view
              <div key={e.id} className="w-[190px] shrink-0 lg:w-[calc((100%-4.375rem)/8)] xl:w-[calc((100%-5.25rem)/8)] flex flex-col rounded-xl bg-white border border-line shadow-card overflow-hidden">
                <div className="relative flex h-[128px] lg:h-[112px] items-center justify-center px-3 pt-3">
                  <span className={`absolute top-2.5 left-2.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold ${recon ? "bg-primary-100 text-primary-700" : "bg-[#eef1f6] text-ink-700"}`}>{e.condition}</span>
                  <button onClick={() => toggle(e.id)} aria-label="Save" className="absolute top-2.5 right-2.5 z-10 text-ink-400 hover:text-primary-600">
                    <Icon name="heart" className={`w-4 h-4 ${favs.has(e.id) ? "text-red-500 fill-red-500" : ""}`} />
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.image} alt={e.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-col flex-1 px-3 pb-3 pt-1">
                  <h3 className="text-[12px] font-bold text-ink-900 leading-snug">
                    <span className="block truncate">{e.title}</span>
                    <span className="block line-clamp-2 min-h-[30px] text-[11px] font-semibold text-ink-500">{e.subtitle}</span>
                  </h3>
                  <div className="mt-auto pt-1.5">
                    <p className="text-[17px] font-extrabold text-ink-900">{e.price}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-green-600">
                      <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-green-500" /> {e.stockLabel}
                    </p>
                    <Link href={e.buyHref} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-1 text-[11.5px] font-bold text-white hover:bg-primary-500 transition-colors">
                      <Icon name="shopping-cart" className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{data.buyButtonText}</span>
                    </Link>
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
