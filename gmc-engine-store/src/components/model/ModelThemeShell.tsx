"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type Ctx = { isDark: boolean; toggle: () => void };

/**
 * null when a component renders outside the shell (home, brand pages) — that's
 * how Header knows whether this page has a theme to switch at all.
 */
const ModelThemeCtx = createContext<Ctx | null>(null);

export const useModelTheme = () => useContext(ModelThemeCtx);

export default function ModelThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // restore + persist choice
  useEffect(() => {
    const saved = (localStorage.getItem("gmc-model-theme") as Theme) || "light";
    setTheme(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("gmc-model-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <ModelThemeCtx.Provider value={{ isDark, toggle: () => setTheme(isDark ? "light" : "dark") }}>
      {/* Header renders INSIDE this wrapper on themed pages so its toggle can
          reach the context. The wrapper is a plain div — no transform, no
          overflow — so the header's `sticky` still resolves against the viewport. */}
      <div className={isDark ? "dark" : ""}>
        <div className="bg-white dark:bg-[#070c18] text-ink-900 dark:text-white transition-colors">
          {children}
        </div>
      </div>
    </ModelThemeCtx.Provider>
  );
}
