"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["featuredEngines"];
type Engine = Data["engines"][number];

function FeaturedCard({ e, buyText, fav, onFav }: { e: Engine; buyText: string; fav: boolean; onFav: () => void }) {
  const recon = e.condition === "Reconditioned";
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.5)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.38)]">
      <div className="relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden border-b border-white/60 bg-[radial-gradient(circle_at_50%_15%,rgba(147,197,253,0.38),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(239,246,255,0.42))] px-4 pt-4">
        <span className={`absolute left-4 top-4 z-10 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm ${recon ? "border-primary-200 bg-primary-500/90 text-white" : "border-white/80 bg-white/70 text-ink-700 backdrop-blur-md"}`}>{e.condition}</span>
        <button onClick={onFav} aria-label="Save" className="absolute right-4 top-4 z-10 rounded-full border border-white/80 bg-white/65 p-1.5 text-ink-400 shadow-sm backdrop-blur-md transition-colors hover:text-primary-600">
          <Icon name="heart" className={`w-5 h-5 ${fav ? "text-red-500 fill-red-500" : ""}`} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={e.image} alt={e.title} className="relative z-[1] h-[174px] w-full max-w-[270px] object-contain drop-shadow-[0_14px_15px_rgba(15,23,42,0.28)]" draggable={false} />
      </div>
      <div className="flex flex-1 flex-col bg-white/35 px-4 pb-4 pt-3">
        <h3 className="text-[13px] font-bold text-ink-900 leading-snug">
          <span className="block line-clamp-1">{e.title}</span>
          <span className="block line-clamp-2 min-h-[34px]">{e.subtitle}</span>
        </h3>
        <div className="mt-auto pt-3">
          <p className="text-xl font-extrabold text-ink-900">{e.price}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {e.stockLabel}
          </p>
          <Link href={e.buyHref} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-ink-900 bg-ink-900 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-white hover:text-ink-900">
            <Icon name="shopping-cart" className="w-4 h-4" />
            {buyText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BrandFeaturedEngines({ data }: { data: Data }) {
  const engines = data.engines;
  const n = engines.length;
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setFavs((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // Desktop — arrow slider. Scrolls by a full page of cards; snap keeps cards
  // aligned to the edge so you never stop on a half-card.
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  };
  useEffect(syncEdges, []);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // Mobile — coverflow (one card centre, two peeking), auto-looping.
  const [center, setCenter] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCenter((c) => (c + 1) % n), 3000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
            <p className="mt-1 text-[13px] text-ink-500 max-w-2xl">{data.subtitle}</p>
          </div>
          <Link href={data.viewAllHref} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-600 hover:text-primary-700 whitespace-nowrap">
            {data.viewAllText}
            <Icon name="chevron-right" className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Desktop — arrow slider (no auto-scroll, no duplicated cards) */}
      <div className="relative mt-6 hidden lg:block max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scroller}
          onScroll={syncEdges}
          className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {engines.map((e) => (
            <div key={e.id} className="w-[300px] shrink-0 snap-start py-1">
              <FeaturedCard e={e} buyText={data.buyButtonText} fav={favs.has(e.id)} onFav={() => toggle(e.id)} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => page(-1)}
          disabled={atStart}
          aria-label="Previous engines"
          className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-700 shadow-card transition-all hover:border-primary-300 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-0"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={atEnd}
          aria-label="Next engines"
          className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink-700 shadow-card transition-all hover:border-primary-300 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-0"
        >
          <Icon name="chevron-right" className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile — coverflow (centre + two sides) */}
      <div className="lg:hidden relative mt-6 h-[430px] overflow-hidden">
        {engines.map((e, i) => {
          const pos = (i - center + n) % n; // 0 centre, 1 right, n-1 left
          const isCenter = pos === 0;
          const isRight = pos === 1;
          const isLeft = pos === n - 1;
          const visible = isCenter || isLeft || isRight;
          const x = isCenter ? 0 : isRight ? 60 : -60;
          const style: React.CSSProperties = {
            transform: `translate(calc(-50% + ${x}%), -50%) scale(${isCenter ? 1 : 0.82})`,
            zIndex: isCenter ? 30 : 20,
            opacity: visible ? (isCenter ? 1 : 0.5) : 0,
            pointerEvents: visible ? "auto" : "none",
          };
          return (
            <div key={e.id} onClick={() => !isCenter && setCenter(i)} className="absolute left-1/2 top-1/2 w-[76vw] max-w-[290px] transition-all duration-500 ease-out cursor-pointer" style={style}>
              <FeaturedCard e={e} buyText={data.buyButtonText} fav={favs.has(e.id)} onFav={() => toggle(e.id)} />
            </div>
          );
        })}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {engines.map((_, i) => (
            <button key={i} onClick={() => setCenter(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${center === i ? "w-4 bg-primary-500" : "w-1.5 bg-ink-400/50"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
