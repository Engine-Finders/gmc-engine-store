import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["usedVsRecon"];

export default function BrandUsedVsRecon({ data }: { data: Data }) {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 rounded-xl border border-line bg-[#f5f7fb] p-6 lg:p-8 lg:divide-x lg:divide-line">
          {data.options.map((opt) => (
            <div key={opt.title} className="lg:px-4 lg:first:pl-0">
              {/* icon sits beside the heading; copy below starts at the icon's left edge */}
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-12 h-12 shrink-0 rounded-xl bg-primary-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)]">
                  <Icon name={opt.icon} className="w-6 h-6" />
                </span>
                <h3 className="text-[15px] font-bold text-ink-900">{opt.title}</h3>
              </div>
              {opt.paragraphs.map((p, i) => (
                <p key={i} className="mt-3 first:mt-3 text-[12.5px] leading-relaxed text-ink-500">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
