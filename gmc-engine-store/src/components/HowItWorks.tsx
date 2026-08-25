import Icon from "./Icon";
import howItWorks from "@/data/howItWorks.json";

export default function HowItWorks() {
  return (
    <section className="bg-white pt-2 pb-10 lg:pt-0 lg:pb-12">
      <div className="max-w-content mx-auto px-5 lg:px-0 ">
        {/* Desktop: single panel */}
        <div className="navy-panel relative hidden overflow-hidden rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-xl px-6 py-6 sm:px-10 lg:px-14 md:block shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55),0_0_40px_-12px_rgba(90,162,255,0.45)]">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.08] to-transparent" />
          <div className="relative">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.22em] text-primary-400">{howItWorks.sectionTitle}</h2>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {howItWorks.steps.map((step, i) => (
              <div key={step.number} className="relative flex gap-4">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-600 text-white text-sm font-bold shadow-cta">{step.number}</span>
                  <span className="grid place-items-center w-12 h-12 rounded-full border border-white/15 text-primary-400">
                    <Icon name={step.icon} className="w-6 h-6" />
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-400">{step.description}</p>
                </div>
                {i < howItWorks.steps.length - 1 && (
                  <span className="hidden md:block absolute right-[-14px] top-4 text-primary-500/60">
                    <svg width="34" height="12" viewBox="0 0 34 12" fill="none">
                      <path d="M0 6h28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M27 1l6 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Mobile: separate stacked glass cards */}
        <div className="md:hidden">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.22em] text-primary-500">{howItWorks.sectionTitle}</h2>
          <div className="mt-5 flex flex-col gap-4">
            {howItWorks.steps.map((step) => (
              <div
                key={step.number}
                className="navy-panel relative overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-2 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.6),0_0_36px_-14px_rgba(90,162,255,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
                <div className="relative flex items-center gap-4">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-primary-600 text-white font-bold shadow-cta">{step.number}</span>
                    <span className="grid place-items-center w-16 h-16 rounded-full border border-white/15 bg-white/[0.04] text-primary-300">
                      <Icon name={step.icon} className="w-8 h-8" />
                    </span>
                  </div>
                  <span className="h-24 w-px bg-white/10 shrink-0" />
                  <span className="text-primary-400 shrink-0">
                    <svg width="34" height="12" viewBox="0 0 34 12" fill="none">
                      <path d="M0 6h28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M27 1l6 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white leading-tight">{step.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
