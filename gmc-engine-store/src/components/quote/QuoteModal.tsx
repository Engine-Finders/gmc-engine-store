"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Icon from "../Icon";
import QuoteForm from "./QuoteForm";
import type { QuoteOptions } from "./QuoteForm";

export type { QuoteOptions };

const QuoteModalContext = createContext<{ open: (opts?: QuoteOptions) => void }>({ open: () => {} });

// Any client component can call `useQuoteModal().open()` to show the shared quote popup.
export const useQuoteModal = () => useContext(QuoteModalContext);

/** Registration box that opens the quote popup (with the lookup already running) on submit. */
export function useRegCheck(extra: QuoteOptions = {}) {
  const { open } = useQuoteModal();
  const [reg, setReg] = useState("");
  return {
    reg,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReg(e.target.value.toUpperCase()),
    onSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      open({ ...extra, reg: reg.trim() });
    },
  };
}

function QuotePopup({ onClose, opts }: { onClose: () => void; opts: QuoteOptions }) {
  return (
    <div className="relative max-h-[92dvh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-[#eef1f6]">
        <Icon name="x-circle" className="h-6 w-6" />
      </button>

      <h2 className="pr-8 text-[22px] font-extrabold leading-tight tracking-tight text-ink-900">{opts.heading || "Get your free engine quote"}</h2>
      <p className="mb-4 mt-1 text-[13px] text-ink-600">Enter your registration to confirm fitment, then leave your details and a specialist will call you back.</p>

      <QuoteForm opts={opts} source="quote-popup" idPrefix="popup" />
    </div>
  );
}

export default function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<QuoteOptions | null>(null);
  // open() may also be handed straight to onClick, so only a plain options object counts
  const open = useCallback((o?: QuoteOptions) => {
    const plain = o && typeof o === "object" && !("nativeEvent" in o) ? o : {};
    setOpts({ ...plain });
  }, []);
  const close = useCallback(() => setOpts(null), []);
  const value = useMemo(() => ({ open }), [open]);

  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [opts, close]);

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      {opts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Get your free engine quote"
          className="fixed inset-x-0 top-0 z-[100] flex h-dvh items-center justify-center bg-black/40 p-3 backdrop-blur-md"
          onClick={close}
        >
          <div className="relative w-full max-w-lg sm:max-w-xl" onClick={(e) => e.stopPropagation()}>
            <QuotePopup onClose={close} opts={opts} />
          </div>
        </div>
      )}
    </QuoteModalContext.Provider>
  );
}
