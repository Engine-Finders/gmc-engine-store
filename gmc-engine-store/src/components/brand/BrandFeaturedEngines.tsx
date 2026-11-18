"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["featuredEngines"];
type Engine = Data["engines"][number];
type Condition = "All listings" | "Used engines" | "Reconditioned engines";

function conditionKey(condition: string) {
  return condition.toLowerCase().startsWith("re") ? "Reconditioned engines" : "Used engines";
}

function ListingCard({ engine }: { engine: Engine }) {
  const condition = conditionKey(engine.condition);
  const quoteOnly = engine.price === "Request A Quote";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white">
      <div className="relative flex h-[180px] items-center justify-center bg-[#f5f8fc] p-3 sm:h-[200px]">
        <span className="absolute left-3 top-3 rounded-md bg-primary-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-primary-800">{condition.replace(" engines", "")}</span>
        <img src={engine.image} alt={`${engine.title} engine`} loading="lazy" className="h-full w-full scale-110 object-contain" />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-[14px] font-extrabold leading-snug text-ink-900">{engine.title.replace(/\s+—\s*$/, "")}</h3>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">{engine.subtitle}</p>
        <div className="mt-auto flex min-h-6 items-center">
          {quoteOnly ? <Link href="#supplier-quote" className="inline-flex w-fit text-[11px] font-semibold leading-none text-ink-900 underline decoration-primary-400 underline-offset-4 transition hover:text-primary-600" aria-label={`Request a quote for ${engine.title.replace(/\s+—\s*$/, "")}`}>
            Request A Quote
          </Link> : <p className="text-[15px] font-extrabold leading-none text-ink-900">From {engine.price}</p>}
        </div>
        <Link href={engine.buyHref} className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-center text-[11px] font-bold leading-tight text-white transition hover:bg-primary-700">View engine &amp; request quotes <Icon name="arrow-right" className="h-4 w-4 shrink-0" /></Link>
      </div>
    </article>
  );
}

export default function BrandFeaturedEngines({ data, brand, brandSlug }: { data: Data; brand: string; brandSlug: string }) {
  const [condition, setCondition] = useState<Condition>("All listings");
  const listingsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const filtered = useMemo(() => condition === "All listings" ? data.engines : data.engines.filter((engine) => conditionKey(engine.condition) === condition), [condition, data.engines]);

  function updateScrollState() {
    const node = listingsRef.current;
    if (!node) return;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 4);
  }

  function scrollListings(direction: "left" | "right") {
    const node = listingsRef.current;
    if (!node) return;
    const amount = window.matchMedia("(max-width: 639px)").matches ? node.clientWidth : node.clientWidth * 0.86;
    node.scrollBy({ left: amount * (direction === "right" ? 1 : -1), behavior: "smooth" });
  }

  useEffect(() => {
    const node = listingsRef.current;
    if (!node) return;
    node.scrollLeft = 0;
    window.requestAnimationFrame(updateScrollState);
  }, [condition, filtered.length]);

  return (
    <section id="replacement-engines" className="scroll-mt-20 bg-white py-5 sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">Explore {brand} replacement engine listings</h2>
            <p className="mt-1 text-[13px] text-ink-500">Choose an engine application, then request quotes from suitable UK suppliers.</p>
          </div>
          <Link href={`/${brandSlug}#replacement-engines`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-700 underline underline-offset-4 hover:text-primary-600">View all listings <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>

        <div className="mt-4 flex flex-nowrap gap-1.5 sm:mt-5 sm:flex-wrap sm:gap-2" role="tablist" aria-label="Listing condition">
          {(["All listings", "Used engines", "Reconditioned engines"] as Condition[]).map((item) => <button key={item} type="button" role="tab" aria-selected={condition === item} onClick={() => setCondition(item)} className={`min-w-0 flex-1 rounded-lg border px-1.5 py-2 text-[10px] font-bold transition sm:flex-none sm:px-4 sm:text-[12px] ${condition === item ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-ink-700 hover:border-primary-300 hover:text-primary-700"}`}><span className="sm:hidden">{item === "All listings" ? "All" : item === "Used engines" ? "Used" : "Reconditioned"}</span><span className="hidden sm:inline">{item}</span></button>)}
        </div>

        {filtered.length ? <>
          <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
            <p className="text-[11px] text-ink-500">Swipe or use the arrows to browse listings.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => scrollListings("left")} disabled={!canScrollLeft} aria-label="Previous engine listings" aria-controls="brand-listings-scroller" className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink-700 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-35"><Icon name="chevron-left" className="h-4 w-4" /></button>
              <button type="button" onClick={() => scrollListings("right")} disabled={!canScrollRight} aria-label="Next engine listings" aria-controls="brand-listings-scroller" className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink-700 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-35"><Icon name="chevron-right" className="h-4 w-4" /></button>
            </div>
          </div>
          <div id="brand-listings-scroller" ref={listingsRef} onScroll={updateScrollState} role="region" aria-label={`${brand} replacement engine listings`} className="no-scrollbar mt-2 flex snap-x snap-mandatory gap-0 overflow-x-auto pb-1 sm:mt-3 sm:gap-3 sm:pb-2 lg:gap-4">
            {filtered.slice(0, 8).map((engine) => <div key={engine.id} className="min-w-full shrink-0 snap-start sm:min-w-[calc((100%-0.75rem)/2)] lg:min-w-[calc((100%-3rem)/4)]"><ListingCard engine={engine} /></div>)}
          </div>
        </> : <div className="mt-5 rounded-xl border border-dashed border-line bg-[#f8fafc] px-4 py-8 text-center text-[13px] text-ink-500">No {condition.toLowerCase()} are currently published for this brand.</div>}
        <p className="mt-3 text-[11px] leading-relaxed text-ink-500 sm:mt-4">Prices are indicative starting prices. Your supplier confirms compatibility, availability, included components and the final quote.</p>
      </div>
    </section>
  );
}
