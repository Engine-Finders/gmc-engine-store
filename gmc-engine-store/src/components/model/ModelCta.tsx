import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

export default function ModelCta({ data }: { data: ModelPageData["cta"] }) {
  return (
    // band 8 (alt)
    <section className="bg-[#f7f9fc] dark:bg-[#0a1120] py-6 lg:py-7">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="navy-panel relative overflow-hidden rounded-xl border border-white/10 px-6 lg:px-10 py-8 lg:py-9">
          <div className="hero-dots absolute inset-0 opacity-40" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-[24px] sm:text-[30px] font-extrabold leading-tight tracking-tight text-white">{data.title}</h2>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-400">{data.description}</p>
            </div>
            <div className="flex items-center lg:justify-end gap-6">
              <Link href={data.buttonHref} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-primary-500 transition-colors">
                <Icon name="search" className="w-4 h-4" /> {data.buttonText}
              </Link>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt="" className="hidden xl:block h-[130px] w-auto object-contain opacity-90 [mix-blend-mode:screen]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
