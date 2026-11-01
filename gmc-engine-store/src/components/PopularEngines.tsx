import Link from "next/link";
import Icon from "./Icon";
import rawBuyEngine from "@/data/buyEngine.json";
import { resolveLinks } from "@/lib/links";

const buyEngine = resolveLinks(rawBuyEngine);

export default function PopularEngines() {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <div className="navy-panel relative overflow-hidden rounded-xl border border-white/10 p-5 sm:p-7 lg:p-8">
          <div className="hero-dots absolute inset-0 opacity-40" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">{buyEngine.sectionTitle}</h2>
              <p className="mt-1.5 max-w-md text-[13px] text-ink-400">{buyEngine.sectionDescription}</p>
            </div>
            <Link href={buyEngine.viewAllHref} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-400 hover:text-primary-300 whitespace-nowrap">
              {buyEngine.viewAllText}
              <Icon name="arrow-right" className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {buyEngine.engines.map((engine) => (
              <Link
                key={engine.code}
                href={engine.href}
                className="group relative overflow-hidden rounded-lg border border-white/15 bg-white/[0.04] p-4 min-h-[138px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/60 hover:bg-white/[0.07] hover:shadow-[0_18px_42px_-16px_rgba(0,0,0,0.6),0_0_36px_-8px_rgba(59,130,246,0.55),inset_0_1px_0_rgba(255,255,255,0.1)]"
              >
                {/* engine illustration — blended into the card (no dark square), larger */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={engine.image} alt="" className="pointer-events-none absolute -right-3 top-1/2 w-[160px] -translate-y-1/2 opacity-90 mix-blend-screen [filter:brightness(1.1)]" />
                <div className="relative max-w-[56%]">
                  <p className="text-xl font-extrabold text-white">{engine.code}</p>
                  <p className="mt-1.5 text-[12px] text-ink-400">{engine.spec}</p>
                  <p className="text-[12px] text-ink-400">{engine.years}</p>
                </div>
                <div className="relative mt-7 flex items-center justify-between">
                  <p className="text-sm text-ink-400">
                    {buyEngine.fromLabel} <span className="text-lg font-extrabold text-white">{engine.priceFrom}</span>
                  </p>
                  <span className="grid place-items-center text-white/70 group-hover:text-white transition-colors">
                    <Icon name="arrow-right" className="w-5 h-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
