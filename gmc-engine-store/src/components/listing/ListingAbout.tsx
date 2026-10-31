import Icon from "../Icon";
import type { ListingPageData } from "@/lib/listing";

type Data = ListingPageData;

/** Horizontal rule with the glowing node — mobile only, between the two blocks. */
function GlowRule() {
  return (
    <div aria-hidden className="relative my-6 h-px w-full bg-line dark:bg-white/10 lg:hidden">
      <span className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
    </div>
  );
}

export default function ListingAbout({ data }: { data: Data }) {
  const { about, included } = data;
  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Desktop: two columns split by a rule, engine on the right of the left column.
            Mobile: the same two blocks stacked, each keeping its own inner 2-up layout
            (copy + engine, then included + not-included) as the reference shows. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-0 lg:gap-12">
          {/* ================= ABOUT ================= */}
          <div className="relative lg:pr-[40%]">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-primary-500 text-primary-600 dark:text-primary-400">
                <Icon name="info" className="h-5 w-5" />
              </span>
              <h2 className="text-[21px] sm:text-[24px] font-bold tracking-tight text-ink-900 dark:text-white">{about.title}</h2>
            </div>

            {/* mobile: copy then engine BELOW it — side-by-side leaves the image
                too small in a ~37% column. From lg the image goes absolute against
                the column's right edge instead. */}
            <div className="mt-4 lg:block">
              <div className="min-w-0">
                {about.paragraphs.map((p, i) => (
                  <p key={i} className="mt-4 first:mt-0 text-[12.5px] sm:text-[13.5px] leading-[1.85] text-ink-600 dark:text-white/70">{p}</p>
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.image}
                alt=""
                aria-hidden
                className={`pointer-events-none mx-auto mt-6 h-[240px] w-auto object-contain sm:h-[300px] lg:absolute lg:-inset-y-2 lg:right-0 lg:mt-0 lg:h-[calc(100%+1rem)] ${
                  // the original about art has its own padding, so cover-fit shows it whole;
                  // an alpha-trimmed engine photo would be cropped by cover, so it is contained
                  about.trimmed ? "lg:w-[40%] lg:object-contain" : "lg:w-[36%] lg:object-cover"
                }`}
              />
            </div>
          </div>

          <GlowRule />

          {/* ============== WHAT'S INCLUDED ============== */}
          <div className="relative lg:border-l lg:border-line dark:lg:border-white/10 lg:pl-12">
            <span aria-hidden className="pointer-events-none absolute -left-px top-1/2 hidden h-24 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-primary-500 to-transparent lg:block" />

            <div className="flex items-center gap-3">
              <span className="shrink-0 text-primary-600 dark:text-primary-400">
                <Icon name="box" className="h-8 w-8" />
              </span>
              <h2 className="text-[21px] sm:text-[24px] font-bold tracking-tight text-ink-900 dark:text-white">{included.title}</h2>
            </div>

            {/* two columns on mobile with a rule between, single column from lg */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6 lg:block">
              <div className="min-w-0">
                <p className="text-[13px] sm:text-[14px] font-semibold text-ink-900 dark:text-white">{included.includedTitle}</p>
                <ul className="mt-3 space-y-2.5">
                  {included.included.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[12px] sm:text-[13.5px] leading-snug text-ink-700 dark:text-white/80">
                      <span className="mt-[1px] shrink-0 text-primary-600 dark:text-primary-500">
                        <Icon name="check-circle" className="h-[17px] w-[17px]" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 border-l border-line pl-4 dark:border-white/10 sm:pl-6 lg:mt-6 lg:border-l-0 lg:pl-0">
                <p className="text-[13px] sm:text-[14px] font-semibold text-ink-900 dark:text-white">{included.excludedTitle}</p>
                <ul className="mt-3 space-y-2.5">
                  {included.excluded.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[12px] sm:text-[13.5px] leading-snug text-ink-600 dark:text-white/65">
                      <span className="mt-[1px] shrink-0 text-ink-400 dark:text-white/40">
                        <Icon name="x-circle" className="h-[17px] w-[17px]" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
