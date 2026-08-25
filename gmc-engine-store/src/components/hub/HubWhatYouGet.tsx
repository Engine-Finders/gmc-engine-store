import Icon from "../Icon";
import type { HubPageData } from "@/lib/hub";

type Data = HubPageData["whatYouGet"];

/** Hairline with the glowing node, between the two blocks on mobile. */
function GlowRule() {
  return (
    <div aria-hidden className="relative my-5 h-px w-full bg-line dark:bg-white/10 lg:hidden">
      <span className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
    </div>
  );
}

export default function HubWhatYouGet({ data }: { data: Data }) {
  const heading = (
    <h2 className="text-[26px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-[30px] lg:text-[28px]">
      {data.titleLead}
      <span className="text-primary-600 dark:text-primary-500">{data.titleHighlight}</span>
      {data.titleTail}
    </h2>
  );

  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Two placements, one per reference: on mobile the title sits ABOVE the
            panel; from lg it lives INSIDE the left panel. `hidden` is display:none,
            so only one is ever in the accessibility tree. */}
        <div className="lg:hidden">{heading}</div>

        <div className="mt-4 grid grid-cols-1 items-stretch gap-5 lg:mt-0 lg:grid-cols-[2.15fr_1fr] lg:gap-6">
          {/* ============ included / not included ============ */}
          <div className="rounded-xl border border-line dark:border-white/10 bg-[#f7f9fc] dark:bg-white/[0.02] p-4 sm:p-5 lg:p-6">
            <div className="hidden lg:mb-5 lg:block">{heading}</div>

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-primary-500 text-primary-600 dark:text-primary-400">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-bold text-ink-900 dark:text-white sm:text-[17px]">{data.includedTitle}</p>
                </div>
                <p className="mt-3 text-[13px] leading-[1.75] text-ink-600 dark:text-white/70 sm:text-[13.5px]">{data.includedBody}</p>
              </div>

              <GlowRule />

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-red-500 text-red-500">
                    <Icon name="close" className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-bold text-ink-900 dark:text-white sm:text-[17px]">{data.excludedTitle}</p>
                </div>
                <ul className="mt-3 space-y-2">
                  {data.excluded.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-600 dark:text-white/70 sm:text-[13.5px]">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400 dark:bg-white/40" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ============ used or reconditioned ============ */}
          <div className="rounded-xl border border-line dark:border-white/10 bg-[#f7f9fc] dark:bg-white/[0.02] p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-primary-500 text-primary-600 dark:text-primary-400">
                <Icon name="info" className="h-4 w-4" />
              </span>
              <p className="text-[16px] font-bold text-ink-900 dark:text-white sm:text-[17px]">{data.asideTitle}</p>
            </div>
            <p className="mt-3 text-[13px] leading-[1.75] text-ink-600 dark:text-white/70 sm:text-[13.5px]">{data.asideBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
