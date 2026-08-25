import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Data = ModelPageData["priceGuide"];

export default function ModelPriceGuide({ data }: { data: Data }) {
  return (
    // band 4 (alt)
    <section className="bg-[#f7f9fc] dark:bg-[#0a1120] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        {/* raised: the band behind is now #f7f9fc, so the panel goes white to stay legible */}
        <div className="relative rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/[0.04] p-6 sm:p-8">
          <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-white">{data.title}</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-500 dark:text-white/55">{data.subtitle}</p>

          {/* timeline */}
          <div className="relative mt-8 flex items-center">
            <span className="text-[13px] font-bold text-primary-600 dark:text-primary-400">{data.rangeStart}</span>
            <div className="relative mx-3 flex-1">
              {/* connector: ink-300 is NOT a defined shade (400/500/700/800/900 only) — it rendered invisible */}
              <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-ink-400/70 dark:bg-white/25" />
              <div className="relative flex justify-around">
                {data.generations.map((g) => (
                  <span key={g.code} className={`h-3.5 w-3.5 rounded-full ${g.current ? "bg-white dark:bg-[#0a1120] ring-4 ring-primary-500" : "bg-ink-800 dark:bg-white/70"}`} />
                ))}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-primary-600 dark:text-primary-400">{data.rangeEnd} <Icon name="arrow-right" className="w-3.5 h-3.5" /></span>
          </div>

          {/* generation cards */}
          <div className="relative mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {data.generations.map((g) => (
                <div key={g.code} className={`rounded-xl border p-4 transition-colors ${g.current ? "border-primary-400 bg-primary-50 dark:bg-primary-500/10" : "border-line dark:border-white/10 bg-white dark:bg-white/[0.03]"}`}>
                  <div className="text-center">
                    <p className={`text-[17px] font-extrabold ${g.current ? "text-primary-600 dark:text-primary-400" : "text-ink-900 dark:text-white"}`}>{g.code}</p>
                    <p className={`text-[12px] ${g.current ? "text-primary-500 dark:text-primary-300" : "text-ink-500 dark:text-white/55"}`}>{g.years}</p>
                  </div>
                  {/* The car PNG is 568x440 but the car itself is only the middle 29.8%
                      of the height (20.7% padding above, 49.5% below), so `object-contain`
                      at h-[70px] painted a ~21px car. Crop to the car band instead:
                      aspect 403/131 is the car's own bbox aspect, and object-position
                      25% centres that band vertically. No mix-blend-mode — the PNG has
                      real alpha, and `lighten` would erase the black W204 car in dark mode. */}
                  <div className="my-3 w-full overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.image}
                      alt={g.code}
                      className="w-full aspect-[403/131] scale-[1.12] object-cover [object-position:center_25%]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="inline-flex items-center gap-1.5 text-ink-600 dark:text-white/60"><Icon name="package" className="w-4 h-4 text-primary-500" /> <b className="text-ink-900 dark:text-white">{g.variants}</b></span>
                    <span className="inline-flex items-center gap-1.5 text-ink-600 dark:text-white/60"><Icon name="wrench" className="w-4 h-4 text-primary-500" /> <b className="text-ink-900 dark:text-white">{g.families}</b></span>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-ink-400 dark:text-white/40">
                    <span>Variants</span><span>Engine Families</span>
                  </div>
                  <p className={`mt-3 text-center text-[14px] ${g.current ? "text-primary-600 dark:text-primary-400" : "text-ink-700 dark:text-white/70"}`}>From <b className="font-extrabold">{g.priceFrom}</b></p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[12.5px] leading-relaxed text-ink-500 dark:text-white/50 max-w-2xl mx-auto">{data.note}</p>
        </div>
      </div>
    </section>
  );
}
