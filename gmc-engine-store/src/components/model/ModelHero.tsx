import Link from "next/link";
import Icon from "../Icon";
import UkFlag from "../UkFlag";
import type { ModelPageData } from "@/lib/model";
import { resolveHref } from "@/lib/links";
import { brandSlugFor } from "@/lib/slugs";
import ModelHeroCarousel, { EngineCard, cqw } from "./ModelHeroCarousel";

type Data = ModelPageData["hero"];

/**
 * The hero visual is authored on a fixed 900x720 design grid (that's what the
 * `pos` values in modelPage.json are in), but it renders fluidly: the stage is
 * aspect-locked and sized with `min(100cqw, <ratio>cqh)`, which is a pure-CSS
 * "contain" fit against the column. Everything inside is positioned as a % of
 * that grid and sized in `cqw`, so the whole composition scales continuously
 * instead of stepping through breakpoints.
 */
const GRID_W = 900;
// 720, not 760: the lowest content is the platform ring (cy 642 + ry 72 = 714), so the
// last ~40px were dead space. Cropping them widens the aspect, which makes the whole
// composition bigger for the same height budget. Nothing moves — y coords stay in px.
const GRID_H = 720;
const pctX = (px: number) => `${(px / GRID_W) * 100}%`;
const pctY = (px: number) => `${(px / GRID_H) * 100}%`;

export default function ModelHero({ data, trustBadges }: { data: Data; trustBadges: Data["trustBadges"] }) {
  return (
    // justify-center only from lg, where the content is guaranteed to fit. On mobile
    // the stack is taller than 100svh, and centering overflow pushes it past both
    // edges where overflow-hidden clips it.
    // No min-h on mobile: with the car gone the stack is well under 100svh, and
    // forcing full viewport height just padded empty space before the next section.
    <section className="relative overflow-hidden bg-white dark:bg-[#070c18] lg:min-h-[calc(100svh-4rem)] flex flex-col justify-start lg:justify-center">
      <div className="max-w-content mx-auto w-full pt-3 pb-4 lg:pt-4 lg:pb-4">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink-500 dark:text-white/55">
          <Link href="/" className="hover:text-ink-900 dark:hover:text-white">Home</Link>
          <Icon name="chevron-right" className="h-3 w-3 opacity-50" />
          <Link href={resolveHref("/brands")} className="hover:text-ink-900 dark:hover:text-white">Brands</Link>
          <Icon name="chevron-right" className="h-3 w-3 opacity-50" />
          <Link href={resolveHref(`/${brandSlugFor(data.brand)}`)} className="hover:text-ink-900 dark:hover:text-white">{data.brand}</Link>
          <Icon name="chevron-right" className="h-3 w-3 opacity-50" />
          <span className="text-ink-800 dark:text-white/85">{data.model} Engines</span>
        </nav>

        {/* the visual gets more than half — the copy column doesn't need 50% */}
        <div className="mt-3 lg:mt-4 grid grid-cols-1 lg:grid-cols-[0.68fr_1.32fr] gap-3 lg:gap-3 items-center">
          {/* LEFT */}
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.logo} alt="" className="h-11 w-11 lg:h-[60px] lg:w-[60px] [@media(max-height:760px)]:lg:h-[48px] [@media(max-height:760px)]:lg:w-[48px] object-contain dark:brightness-150" />
              <span className="text-[15px] font-semibold text-ink-500 dark:text-white/70">{data.brand}</span>
            </div>
            <h1 className="mt-1 font-extrabold tracking-tight leading-[1.02] text-ink-900 dark:text-white text-[32px] sm:text-5xl lg:text-[46px] [@media(max-height:760px)]:lg:text-[40px]">
              {data.model}
              <span className="block mt-1 text-[22px] sm:text-3xl lg:text-[30px] [@media(max-height:760px)]:lg:text-[26px]">{data.titleSuffix}</span>
              <span className="block mt-1 text-primary-600 dark:text-primary-400 text-[26px] sm:text-4xl lg:text-[46px] [@media(max-height:760px)]:lg:text-[40px]">{data.highlight}</span>
            </h1>
            <p className="mt-3 max-w-md text-[13.5px] lg:text-[14px] leading-relaxed text-ink-700 dark:text-ink-400">{data.description}</p>
            {/* Always shown. On short viewports it tightens rather than disappearing. */}
            {/* Always shown, but clamped on mobile — at full length it is ~9 lines and
                would push the card scroller and trust bar out of the viewport. */}
            <p className="mt-2.5 max-w-lg text-[12px] leading-snug line-clamp-3 lg:line-clamp-none lg:text-[12.5px] lg:leading-relaxed text-ink-500 dark:text-white/45 [@media(max-height:800px)]:lg:text-[11.5px] [@media(max-height:800px)]:lg:leading-snug [@media(max-height:700px)]:lg:line-clamp-4">{data.longDescription}</p>

            {/* Reg form */}
            <form id="reg-check" className="mt-4 flex max-w-md items-stretch overflow-hidden rounded-xl border border-line dark:border-white/15 bg-white dark:bg-white/[0.05] shadow-card">
              <span className="flex items-center gap-1.5 border-r border-line dark:border-white/15 bg-[#eef1f6] dark:bg-white/[0.06] px-2.5">
                <UkFlag className="h-4 w-6 rounded-sm" />
                <span className="text-[11px] font-bold text-ink-700 dark:text-white/80">{data.regCheck.countryFlag}</span>
              </span>
              <input type="text" placeholder={data.regCheck.placeholder} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base sm:text-[13px] font-semibold tracking-wide text-ink-900 dark:text-white outline-none placeholder:text-ink-400 dark:placeholder:text-white/40" />
              <button type="submit" className="shrink-0 inline-flex items-center gap-2 bg-primary-600 px-4 lg:px-5 text-sm font-bold text-white hover:bg-primary-500 transition-colors">
                <Icon name="search" className="h-4 w-4" /> {data.regCheck.buttonText}
              </button>
            </form>
          </div>

          {/* RIGHT — orbit + cards + car + platform (desktop) */}
          {/* `container-type: size` makes both cqw and cqh available to the stage */}
          {/* Height, not width, is what caps the stage. Budget it against the fixed
              chrome (header + breadcrumb + trust bar + padding ~ 14rem) rather than a
              flat svh fraction, so it grows as far as the viewport allows without
              pushing the trust bar off-screen on short displays. */}
          {/* aspect-locked rather than a flat height: with a fixed height the stage is
              width-bound and centres inside it, leaving dead space that reads as a gap
              above the trust bar. max-h still caps it on short viewports. */}
          <div className="relative hidden lg:block w-full aspect-[900/720] max-h-[min(840px,calc(100svh-13rem))] [container-type:size]">
            <div className="hero-dots absolute inset-0 opacity-40 dark:opacity-100" />
            {/* The stage keeps the 900x760 authoring ratio and fits itself to the
                column: min(full width, height x ratio) is a contain-fit in pure CSS,
                so it scales continuously with no breakpoints. `container-type:
                inline-size` then makes 100cqw == the stage width, which is what every
                child's cqw size resolves against. */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-[900/720] w-[min(100cqw,125cqh)] [container-type:inline-size]"
            >
              {/* dashed elliptical orbit — behind the cards */}
              <svg viewBox="0 0 900 720" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" style={{ zIndex: 5, filter: "drop-shadow(0 0 6px rgba(79,157,255,0.65))" }}>
                <g stroke="#5aa0ff" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 11" opacity="0.75">
                  <ellipse cx="450" cy="400" rx="436" ry="252" />
                  <ellipse cx="450" cy="382" rx="336" ry="182" />
                </g>
                <g fill="#8ec0ff" opacity="0.9">
                  {[[14, 400], [116, 596], [450, 652], [784, 596], [886, 396], [772, 208], [450, 148], [128, 204]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} />
                  ))}
                </g>
              </svg>

              {/* floating engine cards */}
              {data.cards.map((card) => (
                <div
                  key={card.code}
                  className="absolute"
                  style={{
                    top: pctY(card.pos.top),
                    left: pctX(card.pos.left),
                    width: pctX(card.pos.width),
                    transform: `rotate(${card.pos.rotate}deg)`,
                    zIndex: card.pos.z,
                  }}
                >
                  <EngineCard card={card} />
                </div>
              ))}

              {/* glowing platform rings — under the car, above the cards */}
              <svg viewBox="0 0 900 720" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" style={{ zIndex: 40, filter: "drop-shadow(0 0 14px rgba(79,157,255,0.8))" }}>
                <g stroke="#5aa0ff" fill="none">
                  <ellipse cx="466" cy="642" rx="322" ry="72" strokeWidth="2" opacity="0.75" />
                  <ellipse cx="466" cy="638" rx="266" ry="57" strokeWidth="1.5" opacity="0.55" />
                  <ellipse cx="466" cy="634" rx="206" ry="43" strokeWidth="1" opacity="0.35" />
                </g>
              </svg>

              {/* glow at the wheels — behind the car */}
              <span
                className="pointer-events-none absolute rounded-[50%] bg-[#4f9dff]/30 blur-2xl"
                style={{ zIndex: 44, left: pctX(186), top: pctY(588), width: pctX(560), height: pctY(96) }}
              />

              {/* car — top layer, nothing crosses it. The PNG has real alpha, so NO
                  mix-blend-mode: `lighten` would let the bright ring strokes show
                  through the car's dark bodywork no matter what the z-index is. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* Two cars, toggled by the `dark` class (no JS). They are NOT
                  interchangeable: the light PNG is 746x334 with almost no padding
                  below the wheels (padB 0.9%) while the dark one is 612x408 with
                  24%, so each gets coords derived to put its wheels on the rings
                  and its body across the same span. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.carImageLight}
                alt={data.model}
                className="absolute block object-contain dark:hidden"
                style={{ zIndex: 50, left: pctX(139.5), top: pctY(385), width: pctX(682) }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.carImage}
                alt={data.model}
                className="absolute hidden object-contain dark:block"
                style={{ zIndex: 50, left: pctX(40), top: pctY(273), width: pctX(820) }}
              />
            </div>
          </div>

          {/* MOBILE — coverflow carousel only; the car is desktop-only here */}
          <div className="lg:hidden relative">
            <ModelHeroCarousel cards={data.cards} />
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-2 rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-card">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-line dark:divide-white/10">
            {trustBadges.map((b) => (
              <div key={b.title} className="flex items-center gap-2.5 lg:gap-3 px-3 lg:px-6 py-2 lg:py-3">
                <span className="grid h-8 w-8 lg:h-10 lg:w-10 shrink-0 place-items-center rounded-full border border-primary-200 dark:border-primary-400/40 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <Icon name={b.icon} className="h-4 w-4 lg:h-5 lg:w-5" />
                </span>
                <div>
                  <p className="text-[12px] lg:text-[14px] font-bold text-ink-900 dark:text-white leading-tight">{b.title}</p>
                  <p className="text-[10.5px] lg:text-[12px] text-ink-500 dark:text-white/55 mt-0.5 leading-snug">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
