import Link from "next/link";
import Icon from "./Icon";
import footer from "@/data/footer.json";

function Stars() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="grid place-items-center w-4 h-4 bg-[#00b67a]">
          <Icon name="star" className="w-2.5 h-2.5 text-white" />
        </span>
      ))}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="bg-navy-950 pt-7 pb-4">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 lg:gap-x-8 lg:gap-y-0">
          {/* Brand + social */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brands/logo.png" alt="GMC" className="w-10 h-10 object-contain" />
              <span className="flex flex-col leading-none">
                <span className="text-lg font-extrabold text-white">{footer.logo}</span>
                <span className="text-[9px] tracking-[0.22em] text-ink-400 font-semibold uppercase mt-0.5">{footer.tagline}</span>
              </span>
            </Link>
            <div className="mt-5 flex items-center gap-3">
              {footer.social.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name} className="grid place-items-center w-9 h-9 rounded-full bg-white/10 text-white hover:bg-primary-600 transition-colors">
                  <Icon name={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[13px] font-bold text-white mb-3">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] text-ink-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Trustpilot */}
          <div>
            <p className="text-[13px] font-bold text-white mb-2">{footer.trustpilot.label}</p>
            <Stars />
            <p className="mt-1.5 text-[12px] text-ink-400">{footer.trustpilot.rating} out of 5 based on</p>
            <p className="text-[12px] text-ink-400">{footer.trustpilot.basedOn}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-white">
              <Icon name="star" className="w-3.5 h-3.5 text-[#00b67a]" /> Trustpilot
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-3">
          <p className="text-[12px] text-ink-500 text-center lg:text-left">{footer.description}</p>
        </div>
      </div>
    </footer>
  );
}
