"use client";

import Icon from "../Icon";
import UkFlag from "../UkFlag";
import { useRegCheck } from "../quote/QuoteModal";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["cta"];

export default function BrandCta({ data }: { data: Data }) {
  const rc = useRegCheck();
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="navy-panel relative overflow-hidden rounded-xl border border-white/10 px-6 lg:px-10 py-8 lg:py-9">
          <div className="hero-dots absolute inset-0 opacity-40" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left */}
            <div>
              <h2 className="text-[26px] sm:text-[32px] font-extrabold leading-[1.1] tracking-tight text-white">
                {data.title} <br className="hidden sm:block" />
                <span className="text-primary-500">{data.highlight}</span>
              </h2>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-400">{data.description}</p>

              <form onSubmit={rc.onSubmit} className="mt-5 flex max-w-md items-stretch overflow-hidden rounded-lg bg-white">
                <span className="flex items-center gap-1.5 px-2.5 bg-[#eef1f6] border-r border-line">
                  <UkFlag className="w-6 h-4 rounded-sm" />
                  <span className="text-[11px] font-bold text-ink-700">{data.countryFlag}</span>
                </span>
                <input type="text" placeholder={data.placeholder} value={rc.reg} onChange={rc.onChange} name="reg" autoComplete="off" aria-label="Vehicle registration" className="flex-1 min-w-0 px-3 py-3 text-base sm:text-[13px] font-semibold tracking-wide text-ink-900 placeholder:text-ink-400 outline-none" />
                <button type="submit" className="shrink-0 bg-primary-600 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-500">{data.buttonText}</button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                {data.badges.map((b) => (
                  <span key={b.text} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/75">
                    <Icon name={b.icon} className="w-4 h-4 text-primary-400" />
                    {b.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — car */}
            <div className="relative hidden lg:block h-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.carImage} alt="" className="absolute right-0 bottom-1/2 translate-y-1/2 w-[105%] max-w-none object-contain [mix-blend-mode:lighten]" draggable={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
