import Icon from "../Icon";

const items = [
  { icon: "shield-check", title: "Verified UK businesses", description: "Companies House registration and physical address checked." },
  { icon: "cog", title: "Engine-specific matching", description: "Your supplier confirms the exact engine specification." },
  { icon: "pin", title: "Local & nationwide suppliers", description: "Nearby suppliers prioritised where suitable." },
  { icon: "wrench", title: "Choose your service", description: "Supply only, supply and fit, or rebuild your engine." },
];

export default function BrandWhyUse({ brand }: { brand: string }) {
  return (
    <section className="bg-white py-7 sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">Why use Engined for {brand} replacement engines?</h2>
        <span className="mx-auto mt-4 block h-1 w-24 rounded-full bg-primary-600" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line">
          {items.map((item) => <div key={item.title} className="flex gap-3 lg:px-5 first:lg:pl-0"><Icon name={item.icon} className="h-8 w-8 shrink-0 text-primary-600" /><div><h3 className="text-[14px] font-extrabold text-ink-900">{item.title}</h3><p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{item.description}</p></div></div>)}
        </div>
      </div>
    </section>
  );
}
