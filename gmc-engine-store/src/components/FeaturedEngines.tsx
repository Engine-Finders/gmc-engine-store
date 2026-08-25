"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import engines from "@/data/engines.json";

export default function FeaturedEngines() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const toggleFav = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <SectionHeading title={engines.sectionTitle} description={engines.sectionDescription} linkText={engines.viewAllText} linkHref={engines.viewAllHref} />

        <div className="relative mt-7">
          {/* carousel arrows (decorative on desktop) */}
          <button aria-label="Previous" className="hidden lg:grid place-items-center absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-line shadow-card text-ink-700 hover:text-primary-600 hover:border-primary-300 transition-colors">
            <Icon name="chevron-left" className="w-4 h-4" />
          </button>
          <button aria-label="Next" className="hidden lg:grid place-items-center absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-line shadow-card text-ink-700 hover:text-primary-600 hover:border-primary-300 transition-colors">
            <Icon name="chevron-right" className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {engines.engines.map((engine) => {
              const reconditioned = engine.condition === "Reconditioned";
              return (
                <div
                  key={engine.id}
                  className="group flex flex-col rounded-xl bg-white border border-line shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-card-hover"
                >
                  <div className="relative px-3 pt-3">
                    <span className={`absolute top-3 left-3 z-10 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${reconditioned ? "bg-primary-100 text-primary-700" : "bg-ink-100 text-ink-700"}`} style={reconditioned ? {} : { background: "#e8ecf3" }}>
                      {engine.condition}
                    </span>
                    <button onClick={() => toggleFav(engine.id)} aria-label="Save" className="absolute top-3 right-3 z-10 text-ink-400 hover:text-primary-600 transition-colors">
                      <Icon name="heart" className={`w-4 h-4 ${favorites.has(engine.id) ? "text-red-500 fill-red-500" : ""}`} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={engine.image} alt={engine.title} className="mx-auto h-[150px] sm:h-[160px] w-auto object-contain" />
                  </div>

                  <div className="flex flex-col flex-1 px-3.5 pb-3.5 pt-2">
                    <h3 className="text-[13px] sm:text-[14px] font-bold text-ink-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{engine.title}</h3>
                    <p className="text-[12px] sm:text-[13px] text-ink-500">{engine.subtitle}</p>
                    <p className="mt-2 text-xl sm:text-2xl font-extrabold text-ink-900">{engine.price}</p>
                    <p className="text-[11px] sm:text-[12px] text-ink-500">{engine.installments}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] text-green-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {engine.stockLabel}
                    </p>
                    <Link
                      href={engine.buyHref}
                      className="mt-3 inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-lg border-2 border-ink-900 bg-ink-900 text-[13px] sm:text-sm font-bold text-white transition-colors duration-200 hover:bg-white hover:text-ink-900"
                    >
                      <Icon name="shopping-cart" className="w-4 h-4" />
                      {engines.buyButtonText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile carousel controls */}
          <div className="mt-7 flex items-center justify-center gap-5 lg:hidden">
            <button aria-label="Previous" className="grid place-items-center w-9 h-9 rounded-full bg-white border border-line shadow-card text-ink-700">
              <Icon name="chevron-left" className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {engines.engines.map((_, i) => (
                <span key={i} className={`h-2 rounded-full ${i === 0 ? "w-5 bg-primary-500" : "w-2 bg-ink-400/50"}`} />
              ))}
            </div>
            <button aria-label="Next" className="grid place-items-center w-9 h-9 rounded-full bg-white border border-line shadow-card text-ink-700">
              <Icon name="chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
