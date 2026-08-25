import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

export default function ModelUsedGenerations({ usedVsRecon, generations }: { usedVsRecon: ModelPageData["usedVsRecon"]; generations: ModelPageData["generations"] }) {
  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Used or Reconditioned */}
          <div className="rounded-xl border border-line dark:border-white/10 bg-[#f7f9fc] dark:bg-[#0a1120] p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-600 text-white"><Icon name="help" className="w-5 h-5" /></span>
              <h2 className="text-[18px] sm:text-[20px] font-extrabold tracking-tight text-ink-900 dark:text-white">{usedVsRecon.title}</h2>
            </div>
            <div className="mt-5 space-y-5">
              {usedVsRecon.options.map((o) => (
                <div key={o.title}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-600 text-white"><Icon name={o.icon} className="w-6 h-6" /></span>
                    <p className="text-[14px] font-bold text-primary-600 dark:text-primary-400">{o.title}</p>
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-500 dark:text-white/60">{o.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Through the Generations */}
          <div className="rounded-xl border border-line dark:border-white/10 bg-[#f7f9fc] dark:bg-[#0a1120] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-600 text-white"><Icon name="truck" className="w-5 h-5" /></span>
              <h2 className="text-[18px] sm:text-[20px] font-extrabold tracking-tight text-ink-900 dark:text-white">{generations.title}</h2>
            </div>
            <div className="relative mt-5 space-y-5 pl-4">
              <span className="absolute left-1 top-2 bottom-2 w-px bg-primary-400/50" />
              {generations.items.map((g) => (
                <div key={g.code} className="relative flex gap-4">
                  <span className="absolute -left-4 top-2 h-2.5 w-2.5 rounded-full bg-primary-500 ring-4 ring-[#f7f9fc] dark:ring-[#0a1120]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image} alt={g.code} className="h-12 w-24 shrink-0 object-contain [mix-blend-mode:multiply] dark:[mix-blend-mode:lighten]" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold text-ink-900 dark:text-white">{g.code} <span className="ml-1 text-[12px] font-semibold text-primary-600 dark:text-primary-400">{g.years}</span></p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-600 dark:text-white/60">{g.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
