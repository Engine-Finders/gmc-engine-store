"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import navigation from "@/data/navigation.json";
import brand from "@/data/brand.json";
import { useModelTheme } from "./model/ModelThemeShell";
import { useQuoteModal } from "./quote/QuoteModal";
import type { NavMenu } from "@/lib/navMenu";

type NavLink = { label: string; href?: string; menu?: string; action?: string };

const FITMENT_HEADING = "Check this engine fits your car";

export default function HeaderClient({ menu }: { menu: NavMenu }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // desktop dropdown
  const [openGroup, setOpenGroup] = useState<string | null>(null); // mobile accordion
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const theme = useModelTheme();
  const { open: openQuote } = useQuoteModal();
  const links = navigation.links as NavLink[];
  const items = (key?: string) => (key === "engines" ? menu.engines : key === "brands" ? menu.brands : []);

  // close everything after navigating
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setOpenGroup(null);
  }, [pathname]);

  // desktop dropdown: close on outside click or Escape
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const askQuote = (heading?: string) => {
    setMobileOpen(false);
    setOpenMenu(null);
    openQuote({ heading });
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-950/95 backdrop-blur border-b border-white/5">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brands/logo.png" alt="GMC" className="w-10 h-10 object-contain" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-white">{brand.logo}</span>
              <span className="text-[9px] tracking-[0.22em] text-ink-400 font-semibold uppercase mt-0.5">
                {brand.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-6" aria-label="Main">
            {links.map((link) => {
              const cls =
                "flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide text-ink-400 hover:text-white transition-colors";
              if (link.menu) {
                const list = items(link.menu);
                const isOpen = openMenu === link.menu;
                return (
                  <div key={link.label} className="relative" onMouseEnter={() => setOpenMenu(link.menu!)} onMouseLeave={() => setOpenMenu(null)}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => setOpenMenu(isOpen ? null : link.menu!)}
                      className={`${cls} ${isOpen ? "text-white" : ""} h-[68px]`}
                    >
                      {link.label}
                      <Icon name="chevron-down" className={`w-3.5 h-3.5 text-ink-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="absolute left-0 top-full min-w-[260px] rounded-xl border border-white/10 bg-navy-950 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]">
                        {list.length ? (
                          list.map((it) => (
                            <Link
                              key={it.href}
                              href={it.href}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded-lg px-3 py-2.5 text-[13px] font-semibold normal-case tracking-normal text-white/85 hover:bg-white/10 hover:text-white"
                            >
                              {it.label}
                            </Link>
                          ))
                        ) : (
                          <p className="px-3 py-2.5 text-[13px] text-ink-400">Coming soon</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              if (link.action === "quote") {
                return (
                  <button key={link.label} type="button" onClick={() => askQuote()} className={cls}>
                    {link.label}
                  </button>
                );
              }
              return (
                <Link key={link.label} href={link.href || "/"} className={cls}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Desktop: Check Fitment pill (opens the registration lookup) */}
            <button
              type="button"
              onClick={() => askQuote(FITMENT_HEADING)}
              className="hidden lg:inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/15 bg-white/[0.03] text-[13px] font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-colors"
            >
              <Icon name="search" className="w-4 h-4" />
              {navigation.checkFitment.label}
            </button>
            {/* Mobile: search square - the site searches by registration */}
            <button
              type="button"
              onClick={() => askQuote(FITMENT_HEADING)}
              className="lg:hidden grid place-items-center w-11 h-11 rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition-colors"
              aria-label="Search by registration"
            >
              <Icon name="search" className="w-5 h-5" />
            </button>
            {/* Theme toggle — only on pages wrapped in ModelThemeShell (model,
                listing, hub). The hook returns null elsewhere, so the button
                simply isn't rendered on the home and brand pages. */}
            {theme && (
              <button
                type="button"
                onClick={theme.toggle}
                aria-label={theme.isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="grid place-items-center w-11 h-11 lg:w-10 lg:h-10 rounded-xl lg:rounded-lg border border-white/15 lg:border-transparent text-white/90 hover:bg-white/10 transition-colors"
              >
                {theme.isDark ? (
                  // sun
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  // moon
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                  </svg>
                )}
              </button>
            )}
            {/* Mobile: menu square */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden grid place-items-center w-11 h-11 rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition-colors"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? "close" : "menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-white/10 max-h-[calc(100dvh-68px)] overflow-y-auto" aria-label="Mobile">
            <div className="flex flex-col gap-0.5 pt-3">
              {links.map((link) => {
                const row = "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-white/85 hover:text-white hover:bg-white/5 rounded-lg transition-colors";
                if (link.menu) {
                  const isOpen = openGroup === link.menu;
                  const list = items(link.menu);
                  return (
                    <div key={link.label}>
                      <button type="button" aria-expanded={isOpen} onClick={() => setOpenGroup(isOpen ? null : link.menu!)} className={row}>
                        {link.label}
                        <Icon name="chevron-down" className={`w-4 h-4 text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="ml-3 mb-1 border-l border-white/10 pl-2">
                          {list.length ? (
                            list.map((it) => (
                              <Link key={it.href} href={it.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-white/75 hover:bg-white/5 hover:text-white">
                                {it.label}
                              </Link>
                            ))
                          ) : (
                            <p className="px-3 py-2.5 text-[13px] text-ink-400">Coming soon</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                if (link.action === "quote") {
                  return (
                    <button key={link.label} type="button" onClick={() => askQuote()} className={row}>
                      {link.label}
                    </button>
                  );
                }
                return (
                  <Link key={link.label} href={link.href || "/"} onClick={() => setMobileOpen(false)} className={row}>
                    {link.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => askQuote(FITMENT_HEADING)}
                className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary-600 text-sm font-semibold text-white"
              >
                <Icon name="search" className="w-4 h-4" />
                {navigation.checkFitment.label}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
