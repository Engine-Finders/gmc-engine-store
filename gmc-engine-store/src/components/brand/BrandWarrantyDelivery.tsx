import Icon from "../Icon";
import UkMap from "../UkMap";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["warrantyDelivery"];

export default function BrandWarrantyDelivery({ data }: { data: Data }) {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-line bg-white px-6 lg:px-8 py-7 lg:py-8">
          <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr_260px] gap-6 lg:gap-8 lg:divide-x lg:divide-line">
            {/* icon sits beside the heading; copy below starts at the icon's left edge */}
            {data.items.map((item) => (
              <div key={item.title} className="lg:px-4 lg:first:pl-0">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-primary-50 text-primary-600">
                    <Icon name={item.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="text-[15px] font-bold text-ink-900">{item.title}</h3>
                </div>
                {item.paragraphs.map((p, i) => (
                  <p key={i} className="mt-3 first:mt-2.5 text-[12.5px] leading-relaxed text-ink-500">{p}</p>
                ))}
              </div>
            ))}

            {/* map column — stacked below on mobile, inline on lg+ */}
            <div className="flex items-center justify-center pt-2 lg:pl-4 lg:pt-0">
              <img src="/images/brands/uk_map.png" className="w-auto h-[140px] sm:h-[180px] lg:h-[210px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
