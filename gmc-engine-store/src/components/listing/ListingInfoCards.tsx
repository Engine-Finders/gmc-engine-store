import Link from "next/link";
import Icon from "../Icon";
import type { ListingPageData } from "@/lib/listing";

type Data = ListingPageData;

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 lg:p-6 shadow-card">
      {/* top edge light, as in the reference */}
      <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/70 to-transparent" />
      {children}
    </div>
  );
}

export default function ListingInfoCards({ data }: { data: Data }) {
  const { warranty, otherApplications, whyBuy } = data;
  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {/* Warranty, returns & delivery */}
          <Card>
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-primary-600 dark:text-primary-400">
                <Icon name="shield-check" className="h-8 w-8" />
              </span>
              <h2 className="text-[18px] lg:text-[19px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white">{warranty.title}</h2>
            </div>
            {warranty.paragraphs.map((p, i) => (
              <p key={i} className="mt-4 text-[13px] leading-relaxed text-ink-600 dark:text-white/70">{p}</p>
            ))}
          </Card>

          {/* Other applications */}
          <Card>
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-primary-600 dark:text-primary-400">
                <Icon name="box" className="h-8 w-8" />
              </span>
              <h2 className="text-[18px] lg:text-[19px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white">{otherApplications.title}</h2>
            </div>

            <ul className="mt-4 grid grid-cols-2 lg:grid-cols-1 gap-x-5 sm:gap-x-6">
              {otherApplications.items.map((a) => (
                <li key={a.label}>
                  <Link href={a.href} className="group flex items-center gap-2 py-2 text-[12px] sm:text-[13.5px] text-ink-800 dark:text-white/85 transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                    <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                    <span className="min-w-0 flex-1 truncate">{a.label}</span>
                    <Icon name="chevron-right" className="hidden h-4 w-4 shrink-0 text-ink-400 dark:text-white/40 lg:block" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 border-t border-line dark:border-white/10 pt-4">
              <Link href={otherApplications.footerLinkHref} className="flex items-start gap-2.5 text-[13.5px] font-medium text-primary-600 dark:text-primary-400 hover:underline">
                <span className="mt-[2px] shrink-0 rotate-180"><Icon name="arrow-right" className="h-4 w-4" /></span>
                {otherApplications.footerLinkText}
              </Link>
            </div>
          </Card>

          {/* Why buy */}
          <Card>
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-primary-600 dark:text-primary-400">
                <Icon name="diamond" className="h-8 w-8" />
              </span>
              <h2 className="text-[18px] lg:text-[19px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white">{whyBuy.title}</h2>
            </div>
            <ul className="mt-4 grid grid-cols-2 lg:grid-cols-1 gap-x-5 sm:gap-x-6">
              {whyBuy.items.map((t) => (
                <li key={t} className="flex items-start gap-2 py-1.5 text-[12px] sm:text-[13.5px] text-ink-700 dark:text-white/80">
                  <span className="mt-[2px] shrink-0 text-primary-600 dark:text-primary-400">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
