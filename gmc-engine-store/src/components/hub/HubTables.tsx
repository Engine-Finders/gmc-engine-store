import Link from "next/link";
import Icon from "../Icon";
import type { HubPageData } from "@/lib/hub";

type Compat = HubPageData["compatibility"];
type Prices = HubPageData["prices"];

const PANEL =
  "rounded-xl border border-line dark:border-white/10 bg-[#f7f9fc] dark:bg-white/[0.02] p-4 sm:p-5 lg:p-6";
const TH =
  "px-3 py-2.5 text-[12px] font-semibold leading-tight text-ink-800 dark:text-white/90 lg:px-4 lg:whitespace-nowrap lg:text-[13px]";
// lg:whitespace-nowrap + the wider column below is what keeps every row to a
// single line; py is tightened so 12 rows stay close to the price table's height
const TD =
  "px-3 py-2.5 text-[12px] leading-snug text-ink-700 dark:text-white/75 lg:whitespace-nowrap lg:px-4 lg:py-[7px] lg:text-[13px]";

export default function HubTables({ compatibility, prices }: { compatibility: Compat; prices: Prices }) {
  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-[1.62fr_1fr] lg:gap-6 lg:px-10 xl:px-14">
        {/* ================= COMPATIBILITY ================= */}
        <div className={PANEL}>
          <h2 className="text-[21px] font-bold tracking-tight text-ink-900 dark:text-white sm:text-[24px]">{compatibility.title}</h2>
          <p className="mt-2 text-[13px] leading-[1.65] text-ink-600 dark:text-white/65">{compatibility.intro}</p>

          {/* Scroll container is required: six columns are wider than a phone, and
              without it the table forces the whole PAGE to scroll horizontally. */}
          <div className="mt-4 overflow-x-auto overflow-y-hidden rounded-xl border border-line dark:border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-[#eef2f8] dark:bg-white/[0.06]">
                  {compatibility.columns.map((c) => (
                    <th key={c} className={TH}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compatibility.rows.map((r, i) => (
                  <tr key={`${r.model}-${r.chassis}-${i}`} className="border-t border-line dark:border-white/[0.08] bg-white dark:bg-transparent">
                    <td className={`${TD} font-medium text-ink-900 dark:text-white/90`}>{r.model}</td>
                    <td className={TD}>{r.chassis}</td>
                    <td className={TD}>{r.variants}</td>
                    <td className={TD}>{r.years}</td>
                    <td className={TD}>{r.config}</td>
                    <td className={TD}>
                      <Link href={r.href} className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-primary-600 hover:underline dark:text-primary-400">
                        {r.linkText}
                        <Icon name="chevron-right" className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* the desktop reference drops this line; the mobile one keeps it */}
          <p className="mt-4 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-600 dark:text-white/65 lg:hidden">
            <span className="mt-px shrink-0 text-primary-600 dark:text-primary-400"><Icon name="info" className="h-5 w-5" /></span>
            {compatibility.note}
          </p>
        </div>

        {/* ================= PRICES ================= */}
        <div className={PANEL}>
          <h2 className="text-[21px] font-bold tracking-tight text-ink-900 dark:text-white sm:text-[24px]">{prices.title}</h2>
          <p className="mt-2 text-[13px] leading-[1.65] text-ink-600 dark:text-white/65">{prices.intro}</p>

          <div className="mt-4 overflow-x-auto overflow-y-hidden rounded-xl border border-line dark:border-white/10">
            <table className="w-full min-w-[320px] border-collapse text-left">
              <thead>
                <tr className="bg-[#eef2f8] dark:bg-white/[0.06]">
                  {prices.columns.map((c) => (
                    <th key={c} className={TH}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prices.rows.map((r) => (
                  <tr key={r.application} className="border-t border-line dark:border-white/[0.08] bg-white dark:bg-transparent">
                    <td className={`${TD} font-medium text-ink-900 dark:text-white/90`}>{r.application}</td>
                    <td className={TD}>{r.used}</td>
                    <td className={TD}>{r.recon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl lg:border lg:border-line lg:dark:border-white/10 lg:bg-white lg:dark:bg-white/[0.03] lg:p-4">
            <span className="mt-px shrink-0 text-primary-600 dark:text-primary-400"><Icon name="info" className="h-5 w-5" /></span>
            <p className="text-[12.5px] leading-relaxed text-ink-600 dark:text-white/65">{prices.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
