import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["howItWorks"];

function Arrow() {
  return (
    <svg width="52" height="12" viewBox="0 0 52 12" fill="none" className="hidden md:block shrink-0 self-center mt-8 text-primary-500">
      <path d="M0 6h44" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M43 1l7 5-7 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BrandHowItWorks({ data }: { data: Data }) {
  return (
    <section className="bg-white mt-4 pt-14 pb-14 lg:pt-16 lg:pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-center gap-3">
            <span className="h-0.5 w-8 rounded bg-primary-500" />
            <h2 className="text-center text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600">{data.title}</h2>
            <span className="h-0.5 w-8 rounded bg-primary-500" />
          </div>

          <div className="mt-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-4">
            {data.steps.map((step, i) => (
              <div key={step.number} className="flex md:flex-1 items-start gap-4">
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-600 text-white text-sm font-bold shadow-[0_6px_16px_-6px_rgba(37,99,235,0.6)]">{step.number}</span>
                  <span className="grid place-items-center w-14 h-14 rounded-full bg-primary-50 text-primary-600">
                    <Icon name={step.icon} className="w-7 h-7" />
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-4 text-[13px] leading-relaxed text-ink-500 max-w-[240px]">{step.description}</p>
                </div>
                {i < data.steps.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
