import Icon from "./Icon";
import features from "@/data/features.json";

// Rendered inside the Hero's main container (not a full-width band).
export default function TrustBar() {
  return (
    <div className="relative grid grid-cols-4 overflow-hidden rounded-2xl border border-[#5a9bff]/25 bg-[linear-gradient(180deg,rgba(20,36,78,0.5)_0%,rgba(8,14,34,0.72)_100%)] shadow-[0_0_32px_-10px_rgba(60,130,255,0.55),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_24px_rgba(60,130,255,0.08)] backdrop-blur-xl">
      {/* glass highlight along the top edge */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8cc2ff]/60 to-transparent" />
      {features.items.map((item, i) => (
        <div key={item.title} className="relative flex flex-col items-center gap-2.5 px-3 py-5 text-center lg:flex-row lg:gap-4 lg:px-6 lg:py-6 lg:text-left">
          {/* short divider, like the reference (not full height) */}
          {i > 0 && <span className="pointer-events-none absolute left-0 top-1/2 h-3/5 w-px -translate-y-1/2 bg-white/15" />}
          <Icon name={item.icon} className="h-8 w-8 shrink-0 text-primary-500 lg:h-12 lg:w-12" />
          <div>
            <p className="text-[13px] font-bold leading-tight text-white lg:whitespace-nowrap lg:text-[16px]">{item.title}</p>
            <p className="mt-1 text-[11px] leading-tight text-white/75 lg:text-[14px]">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
