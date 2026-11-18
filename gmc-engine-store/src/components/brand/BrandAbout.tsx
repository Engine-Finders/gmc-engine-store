import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["about"];

export default function BrandAbout({ data, brand }: { data: Data; brand: string }) {
  const image = data.carImage;

  return (
    <section className="bg-[#f4f7fb] py-5 sm:py-8">
      <div className="mx-auto grid max-w-content items-center gap-7 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.2fr] lg:gap-10 lg:px-8">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-primary-700">Engine buying guidance</p>
          <h2 className="mt-2 text-[25px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[30px]">About {brand} replacement engines</h2>
          {data.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-[13px] leading-relaxed text-ink-600">{paragraph}</p>)}
          <Link href="#engine-families" className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-primary-700 underline underline-offset-4 hover:text-primary-600">Explore {brand} engine families <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>
        <figure className="relative min-h-[200px] overflow-hidden rounded-xl bg-cover bg-center sm:min-h-[245px] lg:min-h-[330px] lg:[clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]" style={{ backgroundImage: "url('/images/homepage/buying-guide-studio.png')" }}>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#040b1a]/55 via-transparent to-[#07162b]/20" />
          <div aria-hidden className="absolute bottom-3 left-1/2 z-[5] h-5 w-[52%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-lg" />
          <img src={image} alt={`${brand} vehicle with bonnet open in a workshop`} loading="lazy" className="absolute bottom-0 left-1/2 z-10 h-[145px] w-[78%] -translate-x-1/2 object-contain object-bottom drop-shadow-[0_18px_16px_rgba(0,0,0,0.5)] sm:h-[210px] sm:w-[74%] lg:h-[260px] lg:w-[72%]" />
          <figcaption className="absolute bottom-2 right-3 z-20 text-[11px] italic text-white/80 drop-shadow">Illustrative vehicle image</figcaption>
        </figure>
      </div>
    </section>
  );
}
