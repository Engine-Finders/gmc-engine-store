import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["about"];

// Radial mask so the car photo (on a black backdrop) fades cleanly into the light
// section instead of showing a dark rectangle — keeps it in colour.
const CAR_MASK =
  "radial-gradient(60% 74% at 54% 52%, #000 40%, rgba(0,0,0,0.3) 66%, transparent 82%)";

export default function BrandAbout({ data }: { data: Data }) {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-r from-white via-[#f7f9fc] to-[#eaf0f9] px-5 sm:px-6 lg:px-9 py-6 lg:py-7">

          {/* Car — small, colour, edges masked into the section */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.carImage}
            alt=""
            aria-hidden
            className="hidden lg:block pointer-events-none absolute right-0 bottom-0 lg:w-[28%] max-w-none object-contain object-right-bottom opacity-95"
            style={{ maskImage: CAR_MASK, WebkitMaskImage: CAR_MASK }}
          />

          {/* logo stacks above the heading so the copy starts at the same left edge
              instead of being indented past a floating mark */}
          <div className="relative max-w-full lg:max-w-[74%] pr-0">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.logo} alt="" aria-hidden className="w-10 lg:w-[52px] shrink-0 object-contain opacity-40 [filter:brightness(0.85)]" />
              <h2 className="text-[20px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
            </div>
            {data.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-[13px] leading-relaxed text-ink-600">{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
