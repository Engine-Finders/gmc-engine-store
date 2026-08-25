import Link from "next/link";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import shopByBrand from "@/data/shopByBrand.json";

export default function ShopByBrand() {
  return (
    <section id="shop-by-brand" className="bg-white pb-10 lg:pb-12 scroll-mt-20">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <SectionHeading title={shopByBrand.sectionTitle} description={shopByBrand.sectionDescription} linkText={shopByBrand.viewAllText} linkHref={shopByBrand.viewAllHref} />

        <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {shopByBrand.brands.map((brand) => {
            const isAll = !brand.logo;
            return (
              <Link
                key={brand.name}
                href={brand.href}
                className="group flex items-center gap-2 sm:gap-3.5 rounded-xl border border-line bg-white px-2.5 sm:px-4 py-3 sm:py-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-card-hover hover:border-primary-200 min-w-0"
              >
                <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                  {isAll ? (
                    <span className="grid place-items-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-primary-300 text-primary-600">
                      <Icon name="plus" className="w-5 h-5" />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logo} alt={`${brand.name} logo`} className="max-h-10 sm:max-h-12 w-auto object-contain" />
                  )}
                </span>
                <span className="flex-1 min-w-0 text-[13px] sm:text-[15px] font-bold text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{brand.name}</span>
                <Icon name="arrow-right" className="w-4 h-4 text-ink-400 group-hover:text-primary-600 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
