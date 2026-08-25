"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import navigation from "@/data/navigation.json";
import brand from "@/data/brand.json";
import { useModelTheme } from "./model/ModelThemeShell";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useModelTheme();

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
          <nav className="hidden lg:flex items-center gap-6">
            {navigation.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide text-ink-400 hover:text-white transition-colors"
              >
                {link.label}
                {link.dropdown && <Icon name="chevron-down" className="w-3.5 h-3.5 text-ink-500" />}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Desktop: Check Fitment pill */}
            <Link
              href={navigation.checkFitment.href}
              className="hidden lg:inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/15 bg-white/[0.03] text-[13px] font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-colors"
            >
              <Icon name="search" className="w-4 h-4" />
              {navigation.checkFitment.label}
            </Link>
            {/* Mobile: search square */}
            <button className="lg:hidden grid place-items-center w-11 h-11 rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition-colors" aria-label="Search">
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
            {/* Cart */}
            <button className="relative grid place-items-center w-11 h-11 lg:w-10 lg:h-10 rounded-xl lg:rounded-lg border border-white/15 lg:border-transparent text-white/90 hover:bg-white/10 transition-colors" aria-label="Cart">
              <Icon name="shopping-cart" className="w-5 h-5" />
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 grid place-items-center bg-primary-600 text-white text-[10px] font-bold rounded-full">
                0
              </span>
            </button>
            {/* Mobile: menu square */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden grid place-items-center w-11 h-11 rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <Icon name={mobileOpen ? "close" : "menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-white/10">
            <div className="flex flex-col gap-0.5 pt-3">
              {navigation.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={navigation.checkFitment.href}
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary-600 text-sm font-semibold text-white"
              >
                <Icon name="search" className="w-4 h-4" />
                {navigation.checkFitment.label}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
