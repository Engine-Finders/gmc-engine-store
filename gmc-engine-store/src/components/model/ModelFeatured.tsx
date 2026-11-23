"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["featured"];
type Engine = Data["engines"][number];

function EngineCard({ engine, saved, onToggle, buyButtonText }: { engine: Engine; saved: boolean; onToggle: () => void; buyButtonText: string }) {
  const recon = engine.condition === "Reconditioned";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card">
      <div className="relative flex h-[180px] items-center justify-center bg-[#f5f8fc] p-3 sm:h-[200px]">
        <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${recon ? "bg-primary-100 text-primary-800" : "bg-[#eef1f6] text-ink-700"}`}>{engine.condition}</span>
        <button type="button" onClick={onToggle} aria-label="Save" className="absolute right-3 top-3 z-10 text-ink-400 transition hover:text-primary-600">
          <Icon name="heart" className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={engine.image} alt={engine.title} loading="lazy" className="h-full w-full scale-110 object-contain transition duration-300 group-hover:scale-[1.14]" />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-[14px] font-extrabold leading-snug text-ink-900">{engine.title}</h3>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">{engine.subtitle}</p>
        <div className="mt-1.5 flex min-h-0 items-center">
          <p className="text-[15px] font-extrabold leading-none text-ink-900">{engine.price}</p>
        </div>
        <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-green-600"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" /> {engine.stockLabel}</p>
        <Link href={engine.buyHref} className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-center text-[11px] font-bold leading-tight text-white transition hover:bg-primary-700">
          <Icon name="shopping-cart" className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{buyButtonText}</span>
        </Link>
      </div>
    </article>
  );
}

export default function ModelFeatured({ data }: { data: Data }) {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggle = (id: string) => setFavs((previous) => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const updateArrows = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanPrev(element.scrollLeft > 2);
    setCanNext(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
  }, []);

  useEffect(() => {
    if (showAll) return;
    const element = scrollRef.current;
    if (!element) return;
    updateArrows();
    element.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      element.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [data.engines.length, showAll, updateArrows]);

  const move = (direction: -1 | 1) => {
    const element = scrollRef.current;
    if (element) {
      const amount = window.matchMedia("(max-width: 639px)").matches ? element.clientWidth : Math.max(element.clientWidth * 0.82, 260);
      element.scrollBy({ left: direction * amount, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white py-5 sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">{data.title}</h2>
            <p className="mt-1 text-[13px] text-ink-500">{data.subtitle}</p>
          </div>
          <button type="button" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll} className="hidden whitespace-nowrap text-[13px] font-bold text-primary-700 transition hover:text-primary-600 sm:inline-flex sm:items-center sm:gap-1.5">
            {showAll ? "Show fewer engines" : data.viewAllText}
            <Icon name={showAll ? "chevron-up" : "arrow-right"} className="h-4 w-4" />
          </button>
        </div>

        {showAll ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.engines.map((engine) => <EngineCard key={engine.id} engine={engine} saved={favs.has(engine.id)} onToggle={() => toggle(engine.id)} buyButtonText={data.buyButtonText} />)}
          </div>
        ) : (
          <div className="relative mt-4 sm:mt-5">
            <button type="button" aria-label="Previous featured engines" onClick={() => move(-1)} disabled={!canPrev} className="absolute left-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-700 shadow-card transition hover:border-primary-300 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-0 sm:-left-4">
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <div ref={scrollRef} className="no-scrollbar flex snap-x snap-mandatory gap-0 overflow-hidden scroll-smooth sm:gap-3 lg:gap-4">
              {data.engines.map((engine) => <div key={engine.id} className="w-full shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-3rem)/4)]"><EngineCard engine={engine} saved={favs.has(engine.id)} onToggle={() => toggle(engine.id)} buyButtonText={data.buyButtonText} /></div>)}
            </div>
            <button type="button" aria-label="Next featured engines" onClick={() => move(1)} disabled={!canNext} className="absolute right-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-700 shadow-card transition hover:border-primary-300 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-0 sm:-right-4">
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>
        )}

        <button type="button" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll} className="mt-5 inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-bold text-primary-700 sm:hidden">
          {showAll ? "Show fewer engines" : data.viewAllText}
          <Icon name={showAll ? "chevron-up" : "arrow-right"} className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
