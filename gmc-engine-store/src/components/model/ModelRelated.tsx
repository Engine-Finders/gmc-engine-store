import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

export default function ModelRelated({ data }: { data: ModelPageData["related"] }) {
  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-tight text-ink-900 dark:text-white">{data.title}</h2>
        {/* grid, not flex-wrap: content-width pills left ragged rows with uneven
            trailing gaps. Every cell is now the same width; the "all engines"
            link spans the full row since it's the odd one out semantically. */}
        {/* lg: flex rather than a fixed column count, so every entry shares one row
            whatever the model list length is */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:flex lg:flex-nowrap">
          {data.models.map((m) => {
            const all = "all" in m && m.all;
            return (
              <Link
                key={m.name}
                href={m.href}
                className={`group flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-line dark:border-white/12 bg-white dark:bg-white/[0.04] px-4 py-3 text-[13px] font-bold text-ink-800 dark:text-white/90 shadow-card hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors lg:flex-1 lg:min-w-0 ${
                  all ? "sm:col-span-3 sm:justify-center lg:justify-start" : ""
                }`}
              >
                <Icon name={all ? "star" : "car"} className="w-4 h-4 shrink-0 text-ink-400 dark:text-white/50 group-hover:text-primary-500" />
                <span className={`min-w-0 truncate ${all ? "flex-1 sm:flex-none lg:flex-1" : "flex-1"}`}>{m.name}</span>
                <Icon name="chevron-right" className="w-3.5 h-3.5 shrink-0 text-ink-400 dark:text-white/50" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
