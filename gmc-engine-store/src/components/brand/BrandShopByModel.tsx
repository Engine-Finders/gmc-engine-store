"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["shopByModel"];
type Model = Data["models"][number];

const MERCEDES_ORDER = ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "G-Class", "Sprinter"];

function ModelCard({ model }: { model: Model }) {
  return (
    <Link href={model.href} className="group relative flex min-h-[168px] flex-col rounded-xl border border-line bg-white p-3 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover sm:min-h-[190px] sm:p-3.5">
      <div className="flex h-[86px] items-center justify-center sm:h-[112px]">
        <img src={model.image} alt={`${model.name} vehicle`} loading="lazy" className="vehicle-cutout h-full w-full object-contain" />
      </div>
      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-extrabold text-ink-900">{model.name}</h3>
          <p className="mt-0.5 truncate text-[11px] text-ink-500">{model.chassis || model.families}</p>
        </div>
        <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary-300 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white"><Icon name="arrow-right" className="h-4 w-4" /></span>
      </div>
    </Link>
  );
}

export default function BrandShopByModel({ data, brand }: { data: Data; brand: string }) {
  const isMercedes = brand.toLowerCase().includes("mercedes");
  const allModels = isMercedes
    ? [...data.models].sort((a, b) => {
        const ai = MERCEDES_ORDER.indexOf(a.name);
        const bi = MERCEDES_ORDER.indexOf(b.name);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      })
    : data.models;
  const [expanded, setExpanded] = useState(false);
  const models = expanded ? allModels : allModels.slice(0, 8);
  const canExpand = allModels.length > 8;

  return (
    <section id="shop-by-model" className="scroll-mt-20 bg-[#f4f7fb] py-9 sm:py-10">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">Find {brand} replacement engines by model</h2>
            <p className="mt-1 text-[13px] text-ink-500">{data.subtitle}</p>
          </div>
          {canExpand ? <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-700 underline underline-offset-4 hover:text-primary-600">{expanded ? "Show fewer models" : `View all ${brand} models`} <Icon name={expanded ? "chevron-up" : "arrow-right"} className="h-4 w-4" /></button> : <Link href={data.viewAllHref} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-700 underline underline-offset-4 hover:text-primary-600">View all {brand} models <Icon name="arrow-right" className="h-4 w-4" /></Link>}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {models.map((model) => <ModelCard key={model.name} model={model} />)}
        </div>

        <div className="mt-6 flex justify-center">
          {canExpand ? <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-white px-5 py-2.5 text-[13px] font-bold text-ink-900 transition hover:bg-primary-600 hover:text-white">{expanded ? "Show fewer models" : "Explore all models"} <Icon name={expanded ? "chevron-up" : "arrow-right"} className="h-4 w-4" /></button> : <Link href={data.viewAllHref} className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-white px-5 py-2.5 text-[13px] font-bold text-ink-900 transition hover:bg-primary-600 hover:text-white">Explore all models <Icon name="arrow-right" className="h-4 w-4" /></Link>}
        </div>
      </div>
    </section>
  );
}
