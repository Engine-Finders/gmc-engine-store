import Icon from "./Icon";
import features from "@/data/features.json";

// Rendered inside the Hero's main container (not a full-width band).
export default function TrustBar() {
  return (
    <div className="grid grid-cols-4 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      {features.items.map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center gap-2.5 px-3 py-5 lg:flex-row lg:text-left lg:gap-3.5 lg:px-6 lg:py-6">
          <span className="grid place-items-center w-11 h-11 rounded-full border border-primary-500/40 bg-primary-500/10 text-primary-400 shrink-0">
            <Icon name={item.icon} className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[13px] lg:text-sm font-bold text-white leading-tight">{item.title}</p>
            <p className="text-[11px] lg:text-[12px] text-ink-400 mt-0.5 leading-tight">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
