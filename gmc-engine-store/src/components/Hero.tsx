"use client";

import Icon from "./Icon";
import UkFlag from "./UkFlag";
import HeroOrbit from "./HeroOrbit";
import HeroCarousel from "./HeroCarousel";
import TrustBar from "./TrustBar";
import hero from "@/data/hero.json";
import { useRegCheck } from "./quote/QuoteModal";

/* =========================================================
   Registration Form
   ========================================================= */
function RegistrationForm() {
  const rc = useRegCheck();
  return (
    <div
      id="reg-check"
      className="relative mt-3 max-w-md overflow-hidden rounded-2xl border border-[#5a9bff]/25 bg-[linear-gradient(160deg,rgba(26,46,98,0.55)_0%,rgba(10,18,42,0.75)_100%)] p-3 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6),0_0_32px_-10px_rgba(60,130,255,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] lg:mt-8 lg:max-w-[520px] lg:p-6"
    >
      {/* Glass highlight */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.07] to-transparent" />

      {/* Form heading */}
      <div className="relative flex items-center gap-3 lg:gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-600 lg:h-14 lg:w-14">
          <Icon
            name="search"
            className="h-4 w-4 text-white lg:h-7 lg:w-7"
          />
        </span>

        <div>
          <p className="text-[15px] font-bold text-white lg:text-[22px]">
            {hero.form.title}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="relative mt-1.5 text-[11px] leading-snug text-white/60 lg:-mt-1 lg:pl-[72px] lg:text-[15px] lg:text-white/80">
        {hero.form.description}
      </p>

      {/* Form */}
      <form onSubmit={rc.onSubmit} className="relative mt-2.5 flex flex-col gap-2 sm:flex-row lg:mt-5 lg:gap-3">
        <div className="flex flex-1 items-center overflow-hidden rounded-lg bg-white lg:h-[54px]">
          {/* Country */}
          <span className="flex items-center gap-1.5 self-stretch border-r border-line bg-[#eef1f6] px-2 py-1.5 lg:gap-2 lg:px-3">
            <UkFlag className="h-4 w-6 rounded-sm lg:h-5 lg:w-8" />

            <span className="text-[11px] font-bold text-ink-700 lg:text-[15px]">
              {hero.form.countryFlag}
            </span>
          </span>

          {/* Registration input */}
          <input
            type="text"
            placeholder={hero.form.placeholder}
            value={rc.reg} onChange={rc.onChange} name="reg" autoComplete="off" aria-label="Vehicle registration"
            /* text-base on mobile: iOS Safari auto-zooms the viewport on focus for
               any input under 16px, which pans the page and clips the hero */
            className="min-w-0 flex-1 px-3 py-1.5 text-base sm:text-sm font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400 lg:px-4 lg:text-[16px]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-bold text-white transition-all duration-200 ease-out hover:bg-primary-500 lg:h-[54px] lg:px-5 lg:text-[16px]"
        >
          {hero.form.buttonText}
        </button>
      </form>

      {/* Badges */}
      <div className="relative mt-2.5 flex items-center gap-3 lg:mt-5 lg:gap-0">
        {hero.form.badges.map((badge, i) => (
          <span
            key={badge.text}
            className={`inline-flex items-center gap-1.5 text-[10px] text-white/55 lg:gap-2.5 lg:text-[15px] lg:text-white/85 ${i > 0 ? "lg:ml-6 lg:border-l lg:border-white/20 lg:pl-6" : ""}`}
          >
            <Icon
              name={badge.icon}
              className="h-3.5 w-3.5 text-white/55 lg:h-5 lg:w-5 lg:text-white/85"
            />

            {badge.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Hero
   ========================================================= */
export default function Hero() {
  return (
    <section className="hero-bg relative min-h-[100svh] overflow-hidden lg:min-h-0">
      <div className="relative mx-auto flex min-h-[100svh] max-w-content flex-col px-3 pt-1.5 pb-1.5 lg:min-h-[calc(100svh-68px)] lg:px-0 lg:pt-4 lg:pb-5">

        {/* =====================================================
            HERO GRID
            ===================================================== */}
        <div className="grid grid-cols-1 items-center gap-1 lg:flex-1 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-6">

          {/* ===================================================
              LEFT SIDE
              =================================================== */}
          <div className="relative z-10 order-1">

            {/* Eyebrow */}
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-400 sm:text-xs">
              {hero.eyebrow}
            </p>

            {/* Main heading */}
            <h1 className="mt-1 text-[1.35rem] font-extrabold leading-[0.92] tracking-tight text-white sm:text-6xl lg:mt-4 lg:text-[4rem]">
              {hero.titleLine1}

              <br />

              <span className="text-primary-500">
                {hero.titleHighlight}
              </span>

              {hero.titleLine1Suffix}
            </h1>

            {/* Description */}
            <p className="mt-1 max-w-md text-[10px] leading-snug text-ink-400 lg:mt-5 lg:text-[15px]">
  {hero.description}
</p>

            {/* ===============================================
                DESKTOP REGISTRATION FORM

                Hidden on mobile.
                Visible from lg breakpoint.
                =============================================== */}
            <div className="hidden lg:block">
              <RegistrationForm />
            </div>
          </div>

          {/* ===================================================
              RIGHT SIDE - DESKTOP ORBIT
              Fills the row height and bleeds to the right edge of the viewport.
              =================================================== */}
          <div className="relative order-2 hidden self-stretch lg:block" style={{ minHeight: 440 }}>
            <div className="absolute inset-y-0 -left-6 right-[min(0px,calc((1200px-100vw)/2))]">
              <HeroOrbit />
            </div>
          </div>

          {/* ===================================================
              MOBILE ENGINE CARDS

              Mobile order:
              1. Heading/content
              2. Engine cards
              3. Registration form
              =================================================== */}
          <div className="relative order-2 -mx-4 sm:-mx-6 lg:hidden">

            {/* Background dots */}
            <div className="hero-dots pointer-events-none absolute inset-0" />

            {/* Floating cards */}
            <div className="relative">
              <HeroCarousel />
            </div>
          </div>

          {/* ===================================================
              MOBILE REGISTRATION FORM

              Appears AFTER HeroCarousel.
              =================================================== */}
          <div className="order-3 lg:hidden">
            <RegistrationForm />
          </div>

        </div>

        {/* =====================================================
            TRUST BAR

            Mobile:
            Cards
              ↓
            Registration
              ↓
            TrustBar
            ===================================================== */}
        <div className="mt-3 lg:mt-8">
          <TrustBar />
        </div>

      </div>
    </section>
  );
}