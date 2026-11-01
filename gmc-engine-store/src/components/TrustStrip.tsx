import Icon from "./Icon";
import trust from "@/data/trustStrip.json";

function Stars() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="grid place-items-center w-[19px] h-[19px] rounded-[3px] bg-[#00b67a]">
          <Icon name="star" className="w-3 h-3 text-white" />
        </span>
      ))}
    </span>
  );
}

export default function TrustStrip() {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-0">
        <div className="rounded-xl border border-line bg-[#f5f7fa] px-5 py-6 xl:px-7 xl:py-5">
          <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[2.3fr_1fr_1fr_1fr] xl:items-center xl:gap-0 xl:divide-x xl:divide-line">
            {/* Trustpilot block */}
            <div className="xl:pr-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-ink-900 xl:whitespace-nowrap">{trust.eyebrow}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <span className="text-lg font-extrabold text-ink-900">{trust.trustpilot.label}</span>
                <Stars />
                <span className="text-[11px] text-ink-500">{trust.trustpilot.rating}</span>
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-ink-900">
                  <Icon name="star" className="w-4 h-4 text-[#00b67a]" />
                  {trust.trustpilot.brand}
                </span>
              </div>
            </div>

            {/* Feature items with dividers */}
            {trust.items.map((item) => (
              <div key={item.title} className="flex min-w-0 items-center gap-2.5 xl:px-4">
                <Icon name={item.icon} className="w-8 h-8 shrink-0 text-primary-600" />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-ink-900 leading-tight whitespace-nowrap">{item.title}</p>
                  <p className="mt-1 text-[12px] text-ink-500 leading-snug">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
