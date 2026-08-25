import Link from "next/link";
import Icon from "../Icon";
import type { ListingPageData } from "@/lib/listing";

type Data = ListingPageData["compatible"];

export default function ListingCompatible({ data }: { data: Data }) {
  return (
    <section className="bg-[#f7f9fc] dark:bg-[#0a1120] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-primary-600 dark:text-primary-400">
            <Icon name="car" className="h-8 w-8" />
          </span>
          <h2 className="text-[21px] sm:text-[24px] font-bold tracking-tight text-ink-900 dark:text-white">{data.title}</h2>
        </div>

        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-600 dark:text-white/70">
          {data.intro}{" "}
          <Link href={data.linkHref} className="text-primary-600 dark:text-primary-400 hover:underline">{data.linkText}</Link>
        </p>

        {/* One table at every size — the reference keeps it on mobile too, with cells
            wrapping rather than collapsing into cards. */}
        {/* overflow-x-auto + min-w: without a scroll container the 6-column table was
            forcing the whole PAGE wider than the viewport, which is what shifted the
            hero and clipped text at the left edge on mobile */}
        <div className="mt-5 overflow-x-auto overflow-y-hidden rounded-xl border border-line dark:border-white/10">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="bg-[#eef2f8] dark:bg-white/[0.06]">
                {data.columns.map((c) => (
                  <th key={c} className="px-2.5 py-3 text-[11px] font-semibold leading-tight text-ink-800 dark:text-white/90 sm:px-4 sm:py-4 sm:text-[13px] lg:px-5 lg:text-[13.5px]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.variant} className="border-t border-line dark:border-white/8 bg-white dark:bg-transparent">
                  <td className="px-2.5 py-3 text-[11px] leading-snug text-ink-900 dark:text-white/90 sm:px-4 sm:py-4 sm:text-[13px] lg:px-5 lg:text-[13.5px]">{r.variant}</td>
                  {[r.chassis, r.body, r.years, r.power, r.turbo].map((v, i) => (
                    <td key={i} className="px-2.5 py-3 text-[11px] leading-snug text-ink-700 dark:text-white/70 sm:px-4 sm:py-4 sm:text-[13px] lg:px-5 lg:text-[13.5px]">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 flex items-start gap-3 text-[13px] leading-relaxed text-ink-600 dark:text-white/70">
          <span className="mt-[1px] shrink-0 text-primary-600 dark:text-primary-400">
            <Icon name="info" className="h-5 w-5" />
          </span>
          {data.note}
        </p>
      </div>
    </section>
  );
}
