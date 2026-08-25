"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import UkFlag from "../UkFlag";
import type { ListingPageData } from "@/lib/listing";

type Data = ListingPageData;
type Spec = Data["hero"]["specCards"][number];

/**
 * Floating spec chip. Same glass recipe as the hero engine cards elsewhere on the
 * site: near-transparent fill + moderate blur + thin border, no coloured bloom.
 * Width is a % of the stage so the chips scale with it instead of crowding the
 * engine at small sizes.
 */
function SpecCard({ s, i }: { s: Spec; i: number }) {
  return (
    <div
      // Right-hand cards are anchored by their RIGHT edge. Anchoring everything by
      // `left` pushed them past the stage (left 78% + a 112px min-width overflows a
      // 358px stage), which is what clipped "204 PS" and "Longitudinal".
      className="animate-floatY absolute w-[29%] min-w-[104px] max-w-[152px] lg:w-[30%] lg:max-w-[190px] rounded-xl border border-[#7fb6ff]/45 dark:border-[#8ec4ff]/55 bg-white/55 dark:bg-white/[0.02] px-2 py-1.5 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 backdrop-blur-lg shadow-[0_0_0_1px_rgba(126,182,255,0.18),0_0_16px_-2px_rgba(90,160,255,0.45),0_8px_28px_rgba(0,0,0,0.16)] dark:shadow-[0_0_0_1px_rgba(142,196,255,0.22),0_0_22px_-2px_rgba(90,160,255,0.6),0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]"
      style={{
        top: `${s.pos.top}%`,
        ...(s.pos.left > 50
          // must track the card's own width below, or right-anchored cards drift
          // past the stage edge
          ? { right: `${Math.max(0, 100 - s.pos.left - 29)}%` }
          : { left: `${s.pos.left}%` }),
        transform: `rotate(${s.pos.rotate}deg)`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: `${6.2 + (i % 3) * 0.8}s`,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-xl bg-gradient-to-b from-white/30 dark:from-white/[0.10] to-transparent" />
      <div className="relative flex items-center gap-1 sm:gap-2">
        <span className="shrink-0 text-primary-600 dark:text-primary-400">
          <Icon name={s.icon} className="h-4 w-4 sm:h-[18px] sm:w-[18px] lg:h-[21px] lg:w-[21px]" />
        </span>
        <span className="min-w-0 text-[11.5px] sm:text-[13.5px] lg:text-[15.5px] font-bold leading-tight text-ink-900 dark:text-white">{s.value}</span>
      </div>
      <p className="relative mt-0.5 pl-0 text-[9.5px] sm:mt-1 sm:pl-[26px] sm:text-[10.5px] lg:pl-[30px] lg:text-[12px] leading-tight text-ink-500 dark:text-white/55">{s.label}</p>
    </div>
  );
}

export default function ListingHero({ data }: { data: Data }) {
  const h = data.hero;
  const [option, setOption] = useState(h.options.find((o) => o.default)?.id ?? h.options[0].id);
  const [active, setActive] = useState(0);
  const selected = h.options.find((o) => o.id === option) ?? h.options[0];

  // reference shows 5 thumbs on desktop / 4 on mobile, last one a "+N" overflow tile
  const THUMBS_DESKTOP = 5;
  // `thumbnails` is a separate list from `gallery` on purpose: the thumbs use the
  // alpha-trimmed PNG so the engine fills the tile, while the main stage keeps the
  // untrimmed one, whose transparent padding the podium positioning depends on.
  const thumbs = h.thumbnails ?? h.gallery;
  const visible = thumbs.slice(0, THUMBS_DESKTOP);
  const overflow = h.gallery.length - THUMBS_DESKTOP;

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + h.gallery.length) % h.gallery.length);

  return (
    // Viewport fit: a hard height only from lg. On phones it is a MINIMUM — the
    // section still fills the screen when the content fits, but grows instead of
    // crushing the gallery when it doesn't. A fixed height here meant any device
    // whose text wrapped one line more than expected collapsed the 1fr stage row
    // to nothing (seen on a real Android, invisible in devtools emulation).
    <section className="relative flex flex-col overflow-hidden bg-gradient-to-b from-[#f6f9ff] to-[#eef3fb] dark:from-[#0a1526] dark:to-[#070d1a] min-h-[calc(100svh-69px)] lg:block lg:h-[calc(100svh-69px)] lg:min-h-0 [@media(max-height:700px)]:lg:h-auto">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-40 dark:opacity-80" />
      <div className="relative mx-auto flex w-full flex-1 lg:h-full lg:flex-none max-w-[1440px] flex-col px-4 sm:px-6 lg:px-10 xl:px-14 pt-1.5 pb-2 lg:pt-2.5 lg:pb-4">
        {/* Breadcrumb */}
        <nav className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] lg:text-[13px] text-ink-500 dark:text-white/60">
          {data.breadcrumb.map((b, i) => (
            <span key={b.label} className="inline-flex items-center gap-2">
              {b.href ? (
                <Link href={b.href} className="hover:text-ink-900 dark:hover:text-white transition-colors">{b.label}</Link>
              ) : (
                <span className="text-ink-800 dark:text-white/85">{b.label}</span>
              )}
              {i < data.breadcrumb.length - 1 && <Icon name="chevron-right" className="h-3 w-3 opacity-45" />}
            </span>
          ))}
        </nav>

        {/* ONE shared surface behind the gallery and the buy panel — no inner boxes.
            Its dot texture is also what the spec cards' backdrop-filter blurs; over a
            flat fill they had nothing to refract and the glass looked painted on. */}
        <div className="relative mt-2 min-h-0 flex-1">

          {/* 63/37 split per the brief */}
          <div className="relative grid h-full min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] lg:grid-rows-1 lg:grid-cols-[57fr_43fr] gap-1.5 sm:gap-3 lg:gap-8 xl:gap-10 py-0 lg:py-1 items-stretch">
            {/* ============ LEFT — gallery ============ */}
            <div className="order-2 flex min-h-0 min-w-0 flex-col lg:order-1">
            <div className="flex min-h-0 flex-1 gap-3 lg:gap-4">
              {/* thumbnails — vertical rail on desktop */}
              <div className="hidden lg:flex w-[74px] shrink-0 flex-col justify-start gap-2">
                {visible.map((src, i) => {
                  const isLast = i === THUMBS_DESKTOP - 1 && overflow > 0;
                  return (
                    <button
                      key={src + i}
                      onClick={() => setActive(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`relative grid aspect-square shrink-0 place-items-center overflow-hidden rounded-xl border p-2.5 transition-all ${
                        active === i
                          ? "border-primary-600 shadow-[0_0_0_1px_rgba(37,99,235,0.5),0_0_18px_-2px_rgba(59,130,246,0.55)] bg-primary-50/60 dark:bg-[#0d1a30]"
                          : "border-line dark:border-white/12 bg-white dark:bg-white/[0.03] hover:border-primary-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className={`h-full w-full object-contain ${isLast ? "opacity-30" : ""}`} />
                      {isLast && (
                        <span className="absolute inset-0 grid place-items-center text-[17px] font-bold text-ink-900 dark:text-white">+{overflow}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* main stage — no box of its own, it sits on the shared surface */}
              <div className="relative min-w-0 flex-1">
                {/* aspect-driven on mobile; from lg it just fills whatever height the
                    flex column leaves, which is what makes the hero fit exactly */}
                <div className="relative h-full min-h-[210px] lg:min-h-[130px] lg:aspect-auto">
                  {h.specCards.map((s, i) => (
                    <SpecCard key={s.label} s={s} i={i} />
                  ))}

                  {/* Engine + podium composite. Both PNGs are 583x428 with their own
                      transparent padding, so the podium defines the box and the engine
                      is positioned against it — the CSS rings are gone. */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-[2%] top-[3%] lg:bottom-[4%] lg:top-[8%]">
                    {/* podium — deliberately narrower than the engine above it.
                        Visible disc is 70.7% of this PNG's width, so w-[42%] here
                        renders a disc ~30% of the stage. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.podiumImage}
                      alt=""
                      aria-hidden
                      className="absolute bottom-0 left-1/2 w-[42%] max-w-[300px] -translate-x-1/2 object-contain"
                    />
                    {/* engine — height-driven so it dominates the podium. Its own PNG
                        has 16.6% padding below the block, so bottom-[7%] lands the
                        visible base on the disc. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.gallery[active]}
                      alt={h.title}
                      className="absolute bottom-[7%] left-1/2 h-[97%] w-auto max-w-[96%] lg:max-w-[78%] -translate-x-1/2 object-contain object-bottom drop-shadow-[0_18px_34px_rgba(0,0,0,0.55)]"
                    />
                  </div>

                  {/* prev / next */}
                  <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-1 top-[54%] z-20 hidden h-9 w-9 lg:grid -translate-y-1/2 place-items-center rounded-full border border-line dark:border-white/20 bg-white/90 dark:bg-white/10 text-ink-700 dark:text-white backdrop-blur transition-colors hover:border-primary-400">
                    <Icon name="chevron-left" className="h-4 w-4" />
                  </button>
                  <button onClick={() => go(1)} aria-label="Next image" className="absolute right-1 top-[54%] z-20 hidden h-9 w-9 lg:grid -translate-y-1/2 place-items-center rounded-full border border-line dark:border-white/20 bg-white/90 dark:bg-white/10 text-ink-700 dark:text-white backdrop-blur transition-colors hover:border-primary-400">
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </button>

                  {/* expand */}
                  <button aria-label="Expand image" className="absolute bottom-4 right-4 hidden h-10 w-10 lg:grid place-items-center rounded-full border border-line dark:border-white/20 bg-white/90 dark:bg-white/10 text-ink-700 dark:text-white backdrop-blur">
                    <Icon name="expand" className="h-4 w-4" />
                  </button>

                  {/* dots */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                    {h.gallery.slice(0, 4).map((_, i) => (
                      <button key={i} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} className={`h-2 w-2 rounded-full transition-colors ${active === i ? "bg-primary-600" : "bg-ink-400/50 dark:bg-white/25"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* thumbnails — horizontal row on mobile */}
            <div className="mx-auto mt-1.5 grid w-full max-w-[288px] shrink-0 grid-cols-4 gap-1.5 sm:gap-2 lg:hidden">
              {thumbs.slice(0, 4).map((src, i) => {
                const isLast = i === 3 && h.gallery.length > 4;
                return (
                  <button
                    key={src + i}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative grid aspect-square place-items-center overflow-hidden rounded-xl border p-2.5 transition-all ${
                      active === i
                        ? "border-primary-600 shadow-[0_0_0_1px_rgba(37,99,235,0.5),0_0_18px_-2px_rgba(59,130,246,0.55)] bg-primary-50/60 dark:bg-[#0d1a30]"
                        : "border-line dark:border-white/12 bg-white dark:bg-white/[0.03]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className={`h-full w-full object-contain ${isLast ? "opacity-30" : ""}`} />
                    {isLast && (
                      <span className="absolute inset-0 grid place-items-center text-[17px] font-bold text-ink-900 dark:text-white">+{h.gallery.length - 4}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============ RIGHT — buy panel, also on the shared surface ============ */}
          <div className="contents lg:order-2 lg:flex lg:min-w-0 lg:flex-col lg:justify-center">
            {/* A — badge, title, options, warranty note (above the gallery on mobile) */}
            <div className="order-1 min-w-0 lg:order-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                <Icon name="shield-check" className="h-4 w-4" />
                {h.warrantyBadge}
              </span>
              <span className="text-[11.5px] text-ink-500 dark:text-white/55">{h.sku}</span>
            </div>

            <h1 className="mt-2 lg:mt-3 text-[21px] sm:text-[27px] lg:text-[31px] [@media(max-height:840px)]:lg:text-[27px] [@media(max-height:740px)]:lg:text-[24px] font-extrabold leading-[1.14] tracking-tight text-ink-900 dark:text-white">
              {h.title}
            </h1>
            <p className="mt-1 text-[12.5px] sm:text-[14.5px] lg:text-[15.5px] [@media(max-height:840px)]:lg:text-[14px] text-ink-500 dark:text-white/65">{h.subtitle}</p>

            {/* condition options */}
            <div className="mt-2 lg:mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
              {h.options.map((o) => {
                const on = o.id === option;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOption(o.id)}
                    aria-pressed={on}
                    className={`rounded-xl border px-2.5 py-1.5 lg:py-2 text-left sm:px-3 transition-all ${
                      on
                        ? "border-primary-600 bg-primary-50/70 dark:bg-primary-500/10 shadow-[0_0_0_1px_rgba(37,99,235,0.35)]"
                        : "border-line dark:border-white/12 bg-white dark:bg-white/[0.02] hover:border-primary-300"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 ${on ? "border-primary-600" : "border-ink-400 dark:border-white/35"}`}>
                        {on && <span className="h-2 w-2 rounded-full bg-primary-600" />}
                      </span>
                      <span className="text-[12.5px] sm:text-[14.5px] font-semibold leading-tight text-ink-900 dark:text-white">{o.label}</span>
                    </span>
                    <span className="mt-0.5 block pl-[28px] text-[11px] sm:text-[12.5px] text-ink-500 dark:text-white/55">{o.note}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-1.5 lg:mt-2 inline-flex items-start gap-2 text-[11.5px] sm:text-[12.5px] text-ink-600 dark:text-white/65">
              <span className="mt-[1px] shrink-0 text-primary-600 dark:text-primary-400"><Icon name="shield-check" className="h-4 w-4" /></span>
              {h.warrantyNote}
            </p>
            </div>

            {/* B — price, CTAs, reg checker (below the gallery on mobile) */}
            <div className="order-3 min-w-0 lg:order-none">

            <p className="mt-1.5 lg:mt-2 text-[25px] sm:text-[30px] lg:text-[33px] [@media(max-height:840px)]:lg:text-[28px] [@media(max-height:740px)]:lg:text-[25px] font-extrabold leading-none text-ink-900 dark:text-white">{selected.price}</p>
            <p className="mt-1 text-[12.5px] font-semibold text-green-600 dark:text-green-400">{h.stockLabel}</p>

            <button type="button" className="mt-2 lg:mt-2.5 inline-flex h-[42px] sm:h-[46px] [@media(max-height:840px)]:lg:h-[42px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary-600 text-[15px] font-bold text-white transition-colors hover:bg-primary-500">
              <Icon name="shopping-cart" className="h-5 w-5" />
              {h.addToBasketText}
            </button>

            <button type="button" className="mt-2 inline-flex h-[42px] sm:h-[46px] [@media(max-height:840px)]:lg:h-[42px] w-full items-center justify-center gap-2.5 rounded-xl border border-line dark:border-white/15 bg-white dark:bg-white/[0.03] text-[15px] font-semibold text-ink-900 dark:text-white transition-colors hover:border-primary-300">
              <Icon name="compat" className="h-5 w-5" />
              {h.checkCompatibilityText}
            </button>

            {/* reg lookup */}
            <form className="mt-1.5 lg:mt-2 flex items-stretch gap-2">
              <span className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border border-line dark:border-white/15 bg-white dark:bg-white/[0.03]">
                <span className="flex shrink-0 flex-col items-center justify-center border-r border-line dark:border-white/15 bg-[#eef1f6] dark:bg-white/[0.06] px-2.5">
                  <UkFlag className="h-4 w-6 rounded-sm" />
                  <span className="text-[10px] font-bold text-ink-700 dark:text-white/80">{h.regCheck.countryFlag}</span>
                </span>
                <input
                  type="text"
                  placeholder={h.regCheck.placeholder}
                  className="min-w-0 flex-1 bg-transparent px-2.5 sm:px-3 py-2.5 text-base sm:text-[14px] font-semibold tracking-wide text-ink-900 dark:text-white outline-none placeholder:text-ink-400 dark:placeholder:text-white/40"
                />
              </span>
              <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-2.5 sm:px-4 text-[11.5px] sm:text-[13.5px] font-bold leading-tight text-white transition-colors hover:bg-primary-500">
                {h.regCheck.buttonText}
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-1.5 lg:mt-2 inline-flex items-center gap-2 text-[11.5px] sm:text-[12.5px] text-ink-500 dark:text-white/55">
              <Icon name="lock" className="h-4 w-4" />
              {h.fitmentNote}
            </p>
            </div>
          </div>
          </div>
        </div>

        {/* trust bar — the one element with its own box, per the reference */}
        <div className="mt-3 hidden shrink-0 overflow-hidden rounded-xl lg:block border border-line dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-lg shadow-card">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-y md:divide-y-0 divide-line dark:divide-white/10">
            {h.trustBadges.map((b) => (
              <div key={b.title} className="flex items-center gap-2.5 px-3.5 py-2.5">
                <span className="shrink-0 text-primary-600 dark:text-primary-400">
                  <Icon name={b.icon} className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-tight text-ink-900 dark:text-white">{b.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink-500 dark:text-white/55">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
