import Icon from "./Icon";
import UkFlag from "./UkFlag";
import HeroOrbit from "./HeroOrbit";
import HeroCarousel from "./HeroCarousel";
import TrustBar from "./TrustBar";
import hero from "@/data/hero.json";

/* =========================================================
   Registration Form
   ========================================================= */
function RegistrationForm() {
  return (
    <div
      id="reg-check"
      className="relative mt-3 max-w-md overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6),0_0_30px_-14px_rgba(90,162,255,0.5),inset_0_1px_0_rgba(255,255,255,0.16)] lg:mt-8 lg:p-5"
    >
      {/* Glass highlight */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.12] to-transparent" />

      {/* Form heading */}
      <div className="relative flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-600 shadow-cta lg:h-10 lg:w-10">
          <Icon
            name="search"
            className="h-4 w-4 text-white lg:h-5 lg:w-5"
          />
        </span>

        <div>
          <p className="text-[15px] font-bold text-white lg:text-base">
            {hero.form.title}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="relative mt-1.5 text-[11px] leading-snug text-white/60 lg:mt-3 lg:text-[13px]">
        {hero.form.description}
      </p>

      {/* Form */}
      <form className="relative mt-2.5 flex flex-col gap-2 sm:flex-row lg:mt-4">
        <div className="flex flex-1 items-center overflow-hidden rounded-lg bg-white">
          {/* Country */}
          <span className="flex items-center gap-1.5 border-r border-line bg-[#eef1f6] px-2 py-1.5">
            <UkFlag className="h-4 w-6 rounded-sm" />

            <span className="text-[11px] font-bold text-ink-700">
              {hero.form.countryFlag}
            </span>
          </span>

          {/* Registration input */}
          <input
            type="text"
            placeholder={hero.form.placeholder}
            /* text-base on mobile: iOS Safari auto-zooms the viewport on focus for
               any input under 16px, which pans the page and clips the hero */
            className="min-w-0 flex-1 px-3 py-1.5 text-base sm:text-sm font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-cta"
        >
          {hero.form.buttonText}
        </button>
      </form>

      {/* Badges */}
      <div className="relative mt-2.5 flex items-center gap-3 lg:mt-4 lg:gap-5">
        {hero.form.badges.map((badge) => (
          <span
            key={badge.text}
            className="inline-flex items-center gap-1.5 text-[10px] text-white/55 lg:text-[12px]"
          >
            <Icon
              name={badge.icon}
              className="h-3.5 w-3.5 text-white/55"
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
    <section className="hero-bg relative min-h-[100svh] overflow-hidden">
      <div className="mx-auto flex min-h-[100svh] max-w-content flex-col px-3 pt-1.5 pb-1.5 lg:block lg:px-0 lg:pt-6">

        {/* =====================================================
            HERO GRID
            ===================================================== */}
        <div className="grid grid-cols-1 items-center gap-1 lg:grid-cols-2 lg:gap-10">

          {/* ===================================================
              LEFT SIDE
              =================================================== */}
          <div className="order-1">

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
              RIGHT SIDE — DESKTOP ORBIT
              =================================================== */}
          <div className="order-2 hidden lg:block">
            <HeroOrbit />
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
        <div className="mt-0 lg:mt-1">
          <TrustBar />
        </div>

      </div>
    </section>
  );
}