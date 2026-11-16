"use client";

import { useState } from "react";
import Icon from "../Icon";
import UkFlag from "../UkFlag";
import { useQuoteModal } from "../quote/QuoteModal";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["cta"];

export default function BrandCta({ data, brand }: { data: Data; brand: string }) {
  const { open } = useQuoteModal();
  const [reg, setReg] = useState("");
  const [postcode, setPostcode] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    open({ reg: reg.trim(), postcode: postcode.trim(), brand, requestService: true, heading: `Get quotes for your ${brand} replacement engine` });
  }

  return (
    <section id="supplier-quote" className="scroll-mt-20 bg-white py-9 sm:py-10">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="navy-panel relative overflow-hidden rounded-2xl border border-primary-400/40 px-5 py-7 sm:px-7 lg:px-9 lg:py-8">
          <div className="hero-dots pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-primary-400">Request supplier quotes</p>
              <h2 className="mt-2 max-w-xl text-[27px] font-extrabold leading-tight tracking-tight text-white sm:text-[34px]">Get quotes for your {brand} replacement engine</h2>
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/75">Enter your registration and postcode to find suitable UK suppliers. Choose supply only, supply and fit, or a rebuild of your existing engine.</p>
              <form onSubmit={submit} className="mt-5 max-w-[620px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex overflow-hidden rounded-lg bg-white"><label htmlFor="supplier-quote-reg" className="sr-only">Vehicle registration</label><span className="flex items-center gap-1.5 bg-primary-600 px-3 text-[11px] font-bold text-white"><UkFlag className="h-4 w-6 rounded-sm" />{data.countryFlag}</span><input id="supplier-quote-reg" value={reg} onChange={(event) => setReg(event.target.value.toUpperCase())} autoComplete="off" placeholder={data.placeholder} className="min-w-0 flex-1 px-3 py-3 text-sm font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400" /></div>
                  <div><label htmlFor="supplier-quote-postcode" className="sr-only">Postcode</label><input id="supplier-quote-postcode" value={postcode} onChange={(event) => setPostcode(event.target.value)} autoComplete="postal-code" placeholder="POSTCODE" className="w-full rounded-lg bg-white px-3 py-3 text-sm font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400" /></div>
                </div>
                <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-[14px] font-extrabold text-white transition hover:bg-primary-500">Get free engine quotes <Icon name="arrow-right" className="h-5 w-5" /></button>
              </form>
              <p className="mt-3 text-[12px] font-bold text-white">Your enquiry is shared with a small number of suitable suppliers who may contact you.</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/70">Your supplier confirms compatibility, availability, final pricing and all service terms.</p>
              <div className="mt-5 border-t border-white/20 pt-3 text-[11px] leading-relaxed text-white/65">Submitting an enquiry does not place an order. You arrange any purchase or service directly with your chosen supplier.</div>
            </div>
            <div className="relative flex min-h-[180px] items-end justify-center lg:min-h-[240px]"><img src={data.carImage} alt={`${brand} vehicle`} loading="lazy" className="relative z-10 h-[190px] w-full object-contain object-bottom sm:h-[235px]" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
