import Link from "next/link";
import Icon from "./Icon";
import usedVs from "@/data/usedVsReconditioned.json";
import guides from "@/data/buyersGuides.json";
import warranty from "@/data/warrantyDelivery.json";

type Item = { title: string; description: string; icon: string };

function InfoCard({ id, title, link, items }: { id?: string; title: string; link?: { text: string; href: string }; items: Item[] }) {
  return (
    <div id={id} className="scroll-mt-24 group flex flex-col justify-center rounded-xl border border-line bg-[#f8fafc] px-6 py-5 transition-all duration-300 hover:border-primary-400/60 hover:bg-white hover:shadow-[0_0_0_1px_rgba(37,99,235,0.25),0_16px_40px_-16px_rgba(37,99,235,0.35)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-900">{title}</h3>
        {link && (
          <Link href={link.href} className="inline-flex items-center gap-1 text-[13px] font-bold text-primary-600 hover:text-primary-700">
            {link.text}
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="mt-4 space-y-3.5">
        {items.map((item) => (
          <div key={item.title}>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-full border border-primary-200 bg-primary-50 text-primary-600 shrink-0">
                <Icon name={item.icon} className="w-[26px] h-[26px]" />
              </span>
              <p className="text-[14px] font-bold text-ink-900 leading-snug">{item.title}</p>
            </div>
            <div>
              <p className="mt-2 text-[12px] leading-snug text-ink-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfoCards() {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <InfoCard
            title={usedVs.sectionTitle}
            items={usedVs.options.map((o) => ({ title: o.type, description: o.description, icon: o.icon }))}
          />
          <InfoCard
            id="buyers-guides"
            title={guides.sectionTitle}
            link={{ text: guides.viewAllText, href: guides.viewAllHref }}
            items={guides.guides.map((g) => ({ title: g.title, description: g.description, icon: g.icon }))}
          />
          <InfoCard id="warranty-delivery" title={warranty.sectionTitle} items={warranty.items} />
        </div>
      </div>
    </section>
  );
}
