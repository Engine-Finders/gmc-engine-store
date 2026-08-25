import Icon from "./Icon";
import trust from "@/data/trustStrip.json";

function Stars() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="grid place-items-center w-[22px] h-[22px] rounded-[3px] bg-[#00b67a]">
          <Icon name="star" className="w-3.5 h-3.5 text-white" />
        </span>
      ))}
    </span>
  );
}

export default function TrustStrip() {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-line pt-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:gap-0 xl:divide-x xl:divide-line">
            {/* Trustpilot block */}
            <div className="shrink-0 xl:pr-8">
              <p className="text-[13px] font-bold uppercase tracking-[0.03em] text-ink-900">{trust.eyebrow}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-xl font-extrabold text-ink-900">{trust.trustpilot.label}</span>
                <Stars />
                <span className="text-[12.5px] text-ink-500">{trust.trustpilot.rating}</span>
                <span className="inline-flex items-center gap-1 text-[15px] font-bold text-ink-900">
                  <Icon name="star" className="w-4 h-4 text-[#00b67a]" />
                  {trust.trustpilot.brand}
                </span>
              </div>
            </div>

            {/* Feature items with dividers */}
            {trust.items.map((item) => (
              <div key={item.title} className="flex flex-1 min-w-0 items-center gap-3 xl:px-6 first:xl:pl-8">
                <Icon name={item.icon} className="w-7 h-7 shrink-0 text-primary-600" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-ink-900 leading-tight whitespace-nowrap">{item.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
