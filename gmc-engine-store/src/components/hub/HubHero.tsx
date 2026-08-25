"use client";

import Link from "next/link";
import Icon from "../Icon";
import UkFlag from "../UkFlag";
import type { HubPageData } from "@/lib/hub";

type Hero = HubPageData["hero"];
type Spec = Hero["specCards"][number];

/* Per-card tilt and lateral shift, top → bottom. The middle cards sit closest to
   the engine so the rail reads as a shallow arc curving around it, and the tilt
   flips sign across the centre. `left` (not a transform) does the shift, because
   a transformed wrapper would become a backdrop root and kill the glass blur. */
const TILT = [-5, -3, 0, 3, 5];
const SHIFT = [7, -3, -9, -3, 7];

/**
 * The artwork renders LARGER than its stage box, bleeding past every edge, so it
 * gains height and width without the stage growing (which would break the
 * viewport fit). The bleed is deliberately asymmetric — more to the left and
 * bottom, least to the right — so the engine grows into the empty space beside
 * the copy instead of crowding the spec rail.
 */
const OVERSIZE =
  "pointer-events-none absolute " +
  // mobile: bleeds left/bottom into the empty side of the stage
  "top-[-14%] bottom-[-24%] left-[-26%] right-[-6%] " +
  // desktop: near-even side bleed keeps the engine CENTRED in its stage. The
  // horizontal position is set by the gaps around the stage (wide on the left,
  // none on the right), not by shoving the artwork sideways — doing that pushed
  // it to the extreme edge.
  "lg:top-[-16%] lg:bottom-[-26%] lg:left-[-14%] lg:right-[-14%]";


/**
 * Floating spec chip on the right rail. Same glass recipe the hero engine cards
 * use elsewhere on the site: near-transparent fill + moderate blur + a thin
 * glowing border, no coloured bloom washing over the surface.
 *
 * `rotate:` is the independent CSS property, so the `floatY` animation (which
 * drives `translate:`) composes with it instead of overwriting it.
 */
function SpecCard({ s, i }: { s: Spec; i: number }) {
  return (
    <div
      style={{
        rotate: `${TILT[i % TILT.length]}deg`,
        left: `${SHIFT[i % SHIFT.length]}px`,
        animationDelay: `${i * 0.55}s`,
        animationDuration: `${6 + (i % 3) * 0.9}s`,
      }}
      className="animate-floatY relative overflow-hidden rounded-xl border border-[#7fb6ff]/45 dark:border-[#8ec4ff]/55 bg-white/55 dark:bg-white/[0.02] px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 backdrop-blur-lg shadow-[0_0_0_1px_rgba(126,182,255,0.18),0_0_16px_-2px_rgba(90,160,255,0.45),0_8px_28px_rgba(0,0,0,0.16)] dark:shadow-[0_0_0_1px_rgba(142,196,255,0.22),0_0_22px_-2px_rgba(90,160,255,0.6),0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 dark:from-white/[0.10] to-transparent" />
      <div className="relative flex items-center gap-2 sm:gap-2.5">
        <span className="shrink-0 text-primary-600 dark:text-primary-400">
          <Icon name={s.icon} className="h-[18px] w-[18px] sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px]" />
        </span>
        <span className="min-w-0 truncate text-[12px] sm:text-[14px] lg:text-[15.5px] font-bold leading-tight text-ink-900 dark:text-white">{s.value}</span>
      </div>
      <p className="relative mt-0.5 truncate pl-[26px] text-[10px] sm:pl-[30px] sm:text-[11.5px] lg:pl-[32px] lg:text-[12.5px] leading-none text-ink-500 dark:text-white/55">{s.label}</p>
    </div>
  );
}

export default function HubHero({ data }: { data: HubPageData }) {
  const h = data.hero;

  // "Mercedes OM651 Engine -" ends in a dash, and a normal space lets that dash
  // wrap onto a line of its own once the heading gets narrow. A non-breaking
  // space glues it to the last word, so the line always ends "...Engine -" and
  // the blue half starts on the next line.
  const titleLead = h.titleLead.replace(/\s+([-–—])\s*$/, " $1");

  return (
    // Viewport fit at lg: fixed height + flex column, with the middle row min-h-0
    // so it yields height instead of pushing the trust bar off-screen. Short
    // laptops fall back to natural height rather than crushing the copy.
    // Flat black / flat white, which is also exactly what the hero artwork was
    // rendered on — so the cutout's soft outer halo blends away instead of
    // showing as a patch, the way it would over a gradient.
    <section className="relative overflow-hidden bg-white dark:bg-black lg:h-[calc(100svh-69px)] [@media(max-height:720px)]:lg:h-auto">
      {/* kept (faint): backdrop-filter needs some high-frequency detail behind it
          or the glass spec cards read as flat painted panels */}
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-25 dark:opacity-50" />

      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-4 sm:px-6 lg:px-10 xl:px-14 pt-3 pb-4 lg:pt-3">
        {/* ================= BREADCRUMB ================= */}
        <nav className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] lg:text-[13px] text-ink-500 dark:text-white/60">
          {data.breadcrumb.map((b, i) => (
            <span key={b.label} className="inline-flex items-center gap-2">
              {b.href ? (
                <Link href={b.href} className="transition-colors hover:text-ink-900 dark:hover:text-white">{b.label}</Link>
              ) : (
                <span className="font-semibold text-primary-600 dark:text-primary-400">{b.label}</span>
              )}
              {i < data.breadcrumb.length - 1 && <Icon name="chevron-right" className="h-3 w-3 opacity-45" />}
            </span>
          ))}
        </nav>

        {/* ================= MAIN ROW =================
            `contents` lets the left column's two halves become direct grid items
            on mobile, so the engine can sit BETWEEN them (title → engine → copy)
            exactly as the mobile reference shows. From lg they rejoin one column. */}
        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 sm:gap-4 lg:mt-2 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-16 xl:gap-20">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:justify-center">
            {/* ---- A: brand, title, alias ---- */}
            <div className="order-1 min-w-0 lg:order-none">
              <div className="hidden items-center gap-3 lg:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.brandLogo} alt="" aria-hidden className="h-9 w-9 shrink-0 object-contain" />
                <span className="text-[19px] font-semibold tracking-tight text-ink-900 dark:text-white">{h.brand}</span>
              </div>

              {/* Fluid on mobile: at a fixed 30px "Mercedes OM651 Engine -" is
                  wider than a 393px screen, so it wrapped and left the dash on its
                  own line. clamp() shrinks it just enough to keep that first line
                  whole on any phone, and caps at the old 30px on wider screens. */}
              <h1 className="mt-0 text-[clamp(21px,6.6vw,30px)] leading-[1.08] sm:text-[36px] lg:mt-3 lg:text-[42px] xl:text-[46px] [@media(max-height:820px)]:lg:text-[38px] font-extrabold tracking-tight text-ink-900 dark:text-white">
                {titleLead}
                <br />
                <span className="text-primary-600 dark:text-primary-500">{h.titleHighlight}</span>
                {h.titleTail}
              </h1>

              <p className="mt-2 text-[13.5px] sm:text-[15px] lg:text-[15.5px] text-ink-600 dark:text-white/70">{h.alsoKnownAs}</p>
            </div>

            {/* ---- B: quick specs, blurb, reg check ---- */}
            <div className="order-3 min-w-0 lg:order-none">
              {/* three inline specs with hairline dividers */}
              <div className="mt-4 flex items-stretch divide-x divide-line dark:divide-white/12 lg:mt-6">
                {h.quickSpecs.map((s) => (
                  <div key={s.label} className="flex min-w-0 flex-1 items-center gap-2 pr-3 first:pl-0 [&:not(:first-child)]:pl-3 sm:gap-2.5 sm:pr-4 sm:[&:not(:first-child)]:pl-4">
                    <span className="shrink-0 text-primary-600 dark:text-primary-400">
                      <Icon name={s.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] sm:text-[15px] font-bold leading-tight text-ink-900 dark:text-white">{s.value}</p>
                      <p className="break-words text-[10px] leading-tight sm:text-[12px] text-ink-500 dark:text-white/55">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 max-w-[520px] text-[13.5px] sm:text-[15px] leading-[1.65] text-ink-700 dark:text-white/80 lg:mt-5">{h.description}</p>

              {/* reg lookup — solid white pill, as in both references */}
              <form id="reg-check" className="mt-4 flex max-w-[560px] items-stretch overflow-hidden rounded-xl border border-line bg-white p-1 shadow-[0_18px_40px_-18px_rgba(8,16,32,0.45)] dark:border-white/12 lg:mt-5">
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 dark:border-white/12">
                  <UkFlag className="h-4 w-6 rounded-sm" />
                  <span className="text-[12px] font-bold text-ink-700">{h.regCheck.countryFlag}</span>
                  <Icon name="chevron-down" className="h-3.5 w-3.5 text-ink-500" />
                </span>
                <input
                  type="text"
                  placeholder={h.regCheck.placeholder}
                  // 16px on mobile: anything smaller makes iOS Safari zoom the
                  // viewport on focus, which reads as a broken layout
                  className="min-w-0 flex-1 bg-transparent px-3 text-base sm:text-[14px] font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400"
                />
                <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-primary-500 sm:px-5">
                  {h.regCheck.buttonText}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11.5px] sm:text-[13px] text-ink-500 dark:text-white/60">
                {h.microTrust.map((t, i) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="mr-1 opacity-50">·</span>}
                    <Icon name="shield-check" className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ---- RIGHT: engine stage + spec rail (side by side at every size) ---- */}
          {/* lg:gap-0 — the engine sits right up against the spec rail; the
              breathing room belongs on the other side, against the copy */}
          <div className="order-2 flex min-h-0 min-w-0 items-center gap-1 sm:gap-2 lg:order-none lg:gap-0">
            <div className="relative min-w-0 flex-1">
              {/* aspect-driven on mobile, fills the flex row from lg — that is what
                  lets the hero land exactly on the viewport height */}
              <div className="relative aspect-[5/4] w-full lg:aspect-auto lg:h-full lg:min-h-[340px] mt-0 lg:mt-3">
                {/* Engine on its glowing pedestal, one 5:4 artwork per theme.
                    These are the `_cut` variants: real alpha, background gone,
                    podium + rings kept (see scripts/cutout_hero.js). The source
                    hero_dark/hero_light PNGs are fully opaque — don't use those
                    directly, their plate edge reads as a hard rectangle. */}
                {/* The bleed lives on this WRAPPER, never on the <img>. An image is
                    a replaced element: `width:auto` resolves to its intrinsic
                    1760px rather than to the left/right insets, so putting the
                    insets on the img itself renders it at full size anchored left
                    and throws it off the right edge. The wrapper is a plain div,
                    where left+right does size the box, and the img just fills it. */}
                <div className={OVERSIZE}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.heroImageLight}
                    alt={`${h.brand} OM651 engine`}
                    className="h-full w-full object-contain dark:hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.heroImage}
                    alt={`${h.brand} OM651 engine`}
                    className="hidden h-full w-full object-contain dark:block"
                  />
                </div>
              </div>
            </div>

            {/* gaps are a touch wider than a static rail would need: a ±5deg tilt
                lifts a card's corner ~7px, and without the clearance the tilted
                neighbours touch */}
            <div className="flex w-[126px] shrink-0 flex-col justify-center gap-2.5 sm:w-[150px] sm:gap-3 lg:w-[186px] lg:gap-3.5">
              {h.specCards.map((s, i) => (
                <SpecCard key={s.label} s={s} i={i} />
              ))}
            </div>
          </div>
        </div>

        {/* ================= TRUST BAR ================= */}
        <div className="mt-4 shrink-0 overflow-hidden rounded-xl border border-line dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-lg shadow-card lg:mt-3">
          <div className="grid grid-cols-2 divide-x divide-y divide-line dark:divide-white/10 lg:grid-cols-4 lg:divide-y-0">
            {h.trustBadges.map((b, i) => (
              <div key={b.title} className={`flex items-center gap-2 px-2.5 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3 lg:px-5 ${i % 2 === 0 ? "border-l-0" : ""}`}>
                <span className="shrink-0 text-primary-600 dark:text-primary-400">
                  <Icon name={b.icon} className="h-5 w-5 sm:h-7 sm:w-7" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-[12px] sm:text-[14px] font-bold leading-tight text-ink-900 dark:text-white">{b.title}</p>
                  <p className="mt-0.5 break-words text-[10.5px] sm:text-[12px] leading-snug text-ink-500 dark:text-white/55">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
