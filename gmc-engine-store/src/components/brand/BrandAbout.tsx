import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["about"];

export default function BrandAbout({ data, brand }: { data: Data; brand: string }) {
  const image = brand.toLowerCase().includes("mercedes") ? "/images/brand-page/mercedes-guidance-workshop-v2.png" : data.carImage;

  return (
    <section className="bg-[#f4f7fb] py-9 sm:py-10">
      <div className="mx-auto grid max-w-content items-center gap-7 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.2fr] lg:gap-10 lg:px-8">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-primary-700">Engine buying guidance</p>
          <h2 className="mt-2 text-[25px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[30px]">About {brand} replacement engines</h2>
          {data.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-[13px] leading-relaxed text-ink-600">{paragraph}</p>)}
          <Link href="#engine-families" className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-primary-700 underline underline-offset-4 hover:text-primary-600">Explore {brand} engine families <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>
        <figure className="relative overflow-hidden rounded-xl lg:[clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]">
          <img src={image} alt={`${brand} vehicle with bonnet open in a workshop`} loading="lazy" className="h-[260px] w-full object-cover object-center sm:h-[320px] lg:h-[365px]" />
          <figcaption className="absolute bottom-2 right-3 text-[11px] italic text-white drop-shadow">Illustrative workshop image</figcaption>
        </figure>
      </div>
    </section>
  );
}
