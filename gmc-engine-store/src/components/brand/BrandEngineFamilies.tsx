import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["engineFamilies"];

export default function BrandEngineFamilies({ data }: { data: Data }) {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      {/* full-bleed dark band (end to end) */}
      <div className="navy-panel relative overflow-hidden py-10 lg:py-12">
        <div className="hero-dots absolute inset-0 opacity-30" />
        <div className="relative max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {/* Left */}
            <div className="relative">
              <h2 className="text-[24px] lg:text-[28px] font-extrabold leading-tight tracking-tight text-white">{data.title}</h2>
              <span className="mt-3 block h-0.5 w-12 rounded bg-primary-500" />
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-400 max-w-xs">{data.description}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt="" className="hidden lg:block mt-6 w-[220px] opacity-90 [mix-blend-mode:screen]" />
            </div>

            {/* Right — families. On mobile: show ~12 then scroll inside the section. */}
            <div className="relative max-h-[560px] overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14 lg:gap-x-16">
                {data.families.map((f) => (
                  <Link key={f.code} href={f.href} className="group flex items-center gap-3 py-2.5 border-b border-white/10">
                    <span className="shrink-0 min-w-[76px] rounded-md border border-primary-400/50 bg-primary-500/10 px-2 py-1 text-center text-[11px] font-bold text-primary-300">{f.code}</span>
                    <span title={f.spec} className="flex-1 min-w-0 truncate text-[11.5px] text-white/60">{f.spec}</span>
                    <span className="whitespace-nowrap text-[11px] text-white/55">From <b className="text-white font-bold">{f.priceFrom}</b></span>
                    <Icon name="chevron-right" className="w-4 h-4 text-white/40 group-hover:text-primary-300 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
