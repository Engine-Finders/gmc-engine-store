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
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-white shadow-card overflow-hidden">
      <div className="relative flex h-[128px] items-center justify-center px-3 pt-3">
        <span className={`absolute top-2.5 left-2.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold ${recon ? "bg-primary-100 text-primary-700" : "bg-[#eef1f6] text-ink-700"}`}>
          {engine.condition}
        </span>
        <button onClick={onToggle} aria-label="Save" className="absolute top-2.5 right-2.5 z-10 text-ink-400 hover:text-primary-600">
          <Icon name="heart" className={`w-4 h-4 ${saved ? "text-red-500 fill-red-500" : ""}`} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={engine.image} alt={engine.title} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="flex flex-col flex-1 px-3 pb-3 pt-1">
        <h3 className="text-[12px] font-bold text-ink-900 leading-snug">
          <span className="block truncate">{engine.title}</span>
          <span className="block line-clamp-2 min-h-[30px] text-[11px] font-semibold text-ink-500">{engine.subtitle}</span>
        </h3>
        <div className="mt-auto pt-1.5">
          <p className="text-[17px] font-extrabold text-ink-900">{engine.price}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-green-600">
            <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-green-500" /> {engine.stockLabel}
          </p>
          <Link href={engine.buyHref} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-1 text-[11.5px] font-bold text-white hover:bg-primary-500 transition-colors">
            <Icon name="shopping-cart" className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{buyButtonText}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ModelFeatured({ data }: { data: Data }) {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggle = (id: string) => setFavs((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    if (showAll) return;
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [data.engines.length, showAll, updateArrows]);

  const move = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.82, 260), behavior: "smooth" });
  };

  return (
    // this section stays light in both themes — deliberately no `dark:` variants
    <section className="bg-[#f7f9fc] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
            <p className="mt-1 text-[13px] text-ink-500 max-w-3xl">{data.subtitle}</p>
          </div>
          <button type="button" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-600 whitespace-nowrap">
            {showAll ? "Show fewer engines" : data.viewAllText}
            <Icon name={showAll ? "chevron-up" : "arrow-right"} className="w-4 h-4" />
          </button>
        </div>

        {showAll ? (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.engines.map((engine) => <EngineCard key={engine.id} engine={engine} saved={favs.has(engine.id)} onToggle={() => toggle(engine.id)} buyButtonText={data.buyButtonText} />)}
          </div>
        ) : (
          <div className="relative mt-5">
            <button type="button" aria-label="Previous featured engines" onClick={() => move(-1)} disabled={!canPrev} className="absolute left-1 sm:-left-4 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-700 shadow-card transition-opacity hover:text-primary-600 disabled:pointer-events-none disabled:opacity-0">
              <Icon name="chevron-left" className="w-4 h-4" />
            </button>
            <div ref={scrollRef} className="no-scrollbar flex gap-3 overflow-hidden scroll-smooth">
              {data.engines.map((engine) => (
                <div key={engine.id} className="w-[82%] shrink-0 sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-2.25rem)/4)]">
                  <EngineCard engine={engine} saved={favs.has(engine.id)} onToggle={() => toggle(engine.id)} buyButtonText={data.buyButtonText} />
                </div>
              ))}
            </div>
            <button type="button" aria-label="Next featured engines" onClick={() => move(1)} disabled={!canNext} className="absolute right-1 sm:-right-4 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-700 shadow-card transition-opacity hover:text-primary-600 disabled:pointer-events-none disabled:opacity-0">
              <Icon name="chevron-right" className="w-4 h-4" />
            </button>
          </div>
        )}

        <button type="button" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll} className="mt-5 inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-bold text-primary-600 sm:hidden">
          {showAll ? "Show fewer engines" : data.viewAllText}
          <Icon name={showAll ? "chevron-up" : "arrow-right"} className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
