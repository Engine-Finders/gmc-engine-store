"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["shopByModel"];
type Model = Data["models"][number];

function ModelCard({ m }: { m: Model }) {
  return (
    <Link href={m.href} className="group relative block rounded-xl border border-line bg-[#f6f8fb] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.image} alt={m.name} className="mx-auto h-[64px] w-full object-contain [mix-blend-mode:multiply]" />
      <p className="mt-3 text-[15px] font-bold text-ink-900">{m.name}</p>
      <p className="text-[11px] text-ink-500 mt-0.5">{m.chassis}</p>
      <p className="text-[11px] text-ink-500">{m.families}</p>
      <span className="absolute bottom-4 right-4 grid place-items-center w-8 h-8 rounded-full border border-primary-300 text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-colors">
        <Icon name="arrow-right" className="w-4 h-4" />
      </span>
    </Link>
  );
}

export default function BrandShopByModel({ data }: { data: Data }) {
  const [expanded, setExpanded] = useState(false);
  const models = data.models;
  const shown = expanded ? models : models.slice(0, 10);

  return (
    <section id="shop-by-model" className="scroll-mt-20 bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
            <p className="mt-1 text-[13px] text-ink-500 max-w-xl">{data.subtitle}</p>
          </div>
        </div>

        {/* Mobile — horizontal scroll */}
        <div className="mt-6 sm:hidden -mx-4 px-4 flex gap-3 overflow-x-auto snap-x no-scrollbar">
          {models.map((m) => (
            <div key={m.name} className="w-[160px] shrink-0 snap-start">
              <ModelCard m={m} />
            </div>
          ))}
        </div>

        {/* Desktop — grid, 10 then expand */}
        <div className="mt-6 hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
          {shown.map((m) => (
            <ModelCard key={m.name} m={m} />
          ))}
        </div>

        {models.length > 10 && (
          <div className="hidden sm:flex justify-center mt-7">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-bold text-ink-800 shadow-card hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              {expanded ? "Show fewer models" : `Show all ${models.length} models`}
              <Icon name={expanded ? "chevron-up" : "chevron-down"} className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
