import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["warrantyDelivery"];

const fallback = [
  { icon: "shield", title: "Warranty & coverage", paragraphs: ["Ask about the warranty period, covered parts, labour exclusions and fitting conditions. Obtain the terms from your supplier."] },
  { icon: "truck", title: "Delivery, collection & fitting", paragraphs: ["Confirm delivery availability, charges and timescales. For fitting or rebuilding, agree workshop and vehicle arrangements directly."] },
  { icon: "returns", title: "Returns, refunds & disputes", paragraphs: ["Confirm the supplier’s returns and refund arrangements. Contact your chosen supplier about the purchase, service or any dispute."] },
];

export default function BrandWarrantyDelivery({ data, brand }: { data: Data; brand: string }) {
  const items = data.items.length >= 3 ? data.items.slice(0, 3) : fallback;
  return (
    <section className="bg-white py-5 sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="navy-panel rounded-xl border-t-4 border-primary-500 px-5 py-5 text-white sm:px-7 sm:py-7 lg:px-8">
          <h2 className="text-[24px] font-extrabold tracking-tight sm:text-[28px]">Supplier warranty, delivery and returns</h2>
          <p className="mt-1.5 max-w-3xl text-[13px] text-white/75">Your chosen supplier sets the terms for the {brand} engine or service. Confirm them before purchasing or authorising work.</p>
          <div className="mt-5 grid gap-6 sm:mt-6 lg:grid-cols-3 lg:divide-x lg:divide-white/20">
            {items.map((item, index) => <div key={`${item.title}-${index}`} className="lg:px-5 first:lg:pl-0"><Icon name={index === 0 ? "shield" : index === 1 ? "truck" : "returns"} className="h-9 w-9 text-primary-400" /><h3 className="mt-4 text-[16px] font-extrabold">{index === 0 ? "Warranty & coverage" : index === 1 ? "Delivery, collection & fitting" : "Returns, refunds & disputes"}</h3>{item.paragraphs.map((paragraph) => <p key={paragraph} className="mt-2 text-[12.5px] leading-relaxed text-white/70">{paragraph}</p>)}</div>)}
          </div>
          <div className="mt-6 border-t border-white/20 pt-4 text-[11px] leading-relaxed text-white/70">Engined connects buyers with suppliers. We do not sell engines, provide fitting or rebuilding services, or arbitrate buyer-supplier disputes. You arrange the purchase or service directly with your chosen supplier.</div>
        </div>
      </div>
    </section>
  );
}
