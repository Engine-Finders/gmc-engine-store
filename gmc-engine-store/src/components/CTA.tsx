"use client";

import Icon from "./Icon";
import UkFlag from "./UkFlag";
import data from "@/data/cta.json";
import { useRegCheck } from "./quote/QuoteModal";

export default function CTA() {
  const rc = useRegCheck();
  return (
    <section className="navy-panel relative overflow-hidden">
      <div className=" hero-dots absolute inset-0 opacity-40" />
      <div className="relative max-w-content mx-auto px-3 lg:px-0 ">
        <div className="mt-2 lg:mt-3 grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{data.title}</h2>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink-400">{data.description}</p>
          </div>

          <form onSubmit={rc.onSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex flex-1 items-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-md overflow-hidden">
              <span className="flex items-center gap-1.5 px-3 py-2.5 border-r border-white/15">
                <UkFlag className="w-6 h-4 rounded-sm" />
                <span className="text-[11px] font-bold text-white">{data.countryFlag}</span>
              </span>
              <input
                type="text"
                placeholder={data.placeholder}
                value={rc.reg} onChange={rc.onChange} name="reg" autoComplete="off" aria-label="Vehicle registration"
                className="flex-1 min-w-0 px-3 py-2.5 text-base sm:text-sm font-semibold tracking-wide text-white placeholder:text-white/60 outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-ink-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_rgba(255,255,255,0.4)]"
            >
              {data.buttonText}
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
