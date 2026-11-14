"use client";

import { useState } from "react";
import Icon from "../Icon";
import useLeadForm, { LeadStatus } from "./useLeadForm";
import type { QuoteEngineDetails, QuoteOptions } from "./QuoteForm";

const FIELD = "w-full rounded-lg border border-[#aab3c2] bg-white px-3.5 py-2.5 text-[14px] text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20";

const SERVICE_OPTIONS = [
  { value: "Supply only", label: "Supply Only", icon: "cog" },
  { value: "Supply & fit", label: "Supply & Fit", icon: "wrench" },
  { value: "Rebuild my engine", label: "Rebuild My Engine", icon: "cog" },
  { value: "Consider all options", label: "Consider All Options", icon: "car" },
] as const;

function engineSize(value?: string) {
  const raw = String(value || "").trim();
  const cc = raw.match(/^(\d{3,5})\s*cc$/i);
  if (cc) return `${(Number(cc[1]) / 1000).toFixed(1)} litres`;
  const litres = raw.match(/^(\d+(?:\.\d+)?)\s*l(?:itre|iter)?$/i);
  if (litres) return `${litres[1]} litres`;
  return raw;
}

function Label({ icon, children, htmlFor }: { icon: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 flex items-center gap-2 text-[13px] font-extrabold text-ink-900">
      <Icon name={icon} className="h-4 w-4 text-ink-900" />
      {children}
    </label>
  );
}

function SelectedEngine({ engine, onChange }: { engine: QuoteEngineDetails; onChange: () => void }) {
  return (
    <div className="-mx-5 grid gap-4 bg-[#eef4fb] px-5 py-3 sm:-mx-8 sm:grid-cols-[0.9fr_1.1fr] sm:gap-6 sm:px-8 sm:py-4">
      <div className="flex flex-col items-center justify-center border-b border-[#c7d1df] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
        {engine.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={engine.image} alt={`${engine.brand} ${engine.code} engine`} className="h-44 w-full scale-[1.08] object-contain sm:h-52 sm:scale-100" />
        )}
        <p className="mt-1 text-center text-[12px] text-ink-700">Representative {engine.brand} engine image</p>
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-[13px] font-extrabold uppercase tracking-wide text-primary-700">Your Selected Engine</p>
        <h3 className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight text-[#071a34] sm:text-[28px]">{engine.brand} {engine.code}</h3>
        <dl className="mt-2 divide-y divide-[#c7d1df] border-y border-[#c7d1df]">
          <div className="grid grid-cols-[22px_1fr_auto] items-center gap-2 py-2 text-[13px]">
            <Icon name="cog" className="h-5 w-5 text-ink-900" />
            <dt className="text-ink-900">Engine Family:</dt>
            <dd className="font-extrabold text-ink-900">{engine.code}</dd>
          </div>
          <div className="grid grid-cols-[22px_1fr_auto] items-center gap-2 py-2 text-[13px]">
            <Icon name="cog" className="h-5 w-5 text-ink-900" />
            <dt className="text-ink-900">Engine Size:</dt>
            <dd className="font-extrabold text-ink-900">{engineSize(engine.displacement) || "Not Provided"}</dd>
          </div>
          <div className="grid grid-cols-[22px_1fr_auto] items-center gap-2 py-2 text-[13px]">
            <Icon name="fuel" className="h-5 w-5 text-ink-900" />
            <dt className="text-ink-900">Fuel Type:</dt>
            <dd className="font-extrabold text-ink-900">{engine.fuel || "Not Provided"}</dd>
          </div>
        </dl>
        <button type="button" onClick={onChange} className="mt-2 self-start text-[13px] font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-600">
          Not Your Engine? Change Selection
        </button>
      </div>
    </div>
  );
}

export default function EngineFamilyQuoteForm({ opts, onClose }: { opts: QuoteOptions & { engine: QuoteEngineDetails }; onClose: () => void }) {
  const lead = useLeadForm("quote-popup");
  const [service, setService] = useState("Supply only");
  const id = (name: string) => `engine-popup-${name}`;

  return (
    <form onSubmit={lead.handleSubmit} className="bg-white px-5 pb-6 pt-0 sm:px-8 sm:pb-7">
      <input type="hidden" name="vehicle_part" value={opts.part || "Engine"} />
      <input type="hidden" name="engine_brand" value={opts.engine.brand} />
      <input type="hidden" name="engine_code" value={opts.engine.code} />
      <input type="hidden" name="engine_displacement" value={opts.engine.displacement || ""} />
      <input type="hidden" name="engine_fuel" value={opts.engine.fuel || ""} />

      <SelectedEngine engine={opts.engine} onChange={onClose} />
      <p className="-mx-5 bg-[#f4f7fb] px-4 py-2.5 text-center text-[12px] leading-5 text-ink-700 sm:-mx-8 sm:px-6 sm:text-[13px]">
        Your supplier will confirm the exact engine specification before quoting.
      </p>

      <h2 className="mt-6 text-[20px] font-extrabold leading-tight tracking-tight text-[#071a34] sm:text-[22px]">Where Should Suppliers Send Your Quotes?</h2>
      <div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2">
        <div>
          <Label icon="user" htmlFor={id("name")}>Full Name</Label>
          <input id={id("name")} name="name" required autoComplete="name" placeholder="Your Full Name" className={FIELD} />
        </div>
        <div>
          <Label icon="mail" htmlFor={id("email")}>Email Address</Label>
          <input id={id("email")} name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={FIELD} />
        </div>
        <div>
          <Label icon="phone" htmlFor={id("number")}>Phone Number</Label>
          <input id={id("number")} name="number" type="tel" required autoComplete="tel" placeholder="Your Contact Number" className={FIELD} />
        </div>
        <div>
          <Label icon="pin" htmlFor={id("postcode")}>Postcode</Label>
          <input id={id("postcode")} name="postcode" autoComplete="postal-code" placeholder="e.g. B1 1AA" className={FIELD} />
        </div>
      </div>

      <div className="mt-4">
        <Label icon="chat" htmlFor={id("description")}>Anything Else? <span className="font-normal text-ink-600">(Optional)</span></Label>
        <textarea id={id("description")} name="description" rows={3} placeholder="Vehicle model, year or details about what you need" className={`${FIELD} resize-y`} />
      </div>

      <fieldset className="mt-5">
        <legend className="text-[20px] font-extrabold leading-tight tracking-tight text-[#071a34] sm:text-[22px]">What Do You Need?</legend>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((option) => (
            <label key={option.value} className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-[#aab3c2] px-3.5 py-2.5 transition hover:border-primary-500 has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                name="service"
                value={option.value}
                checked={service === option.value}
                onChange={() => setService(option.value)}
                className="h-4 w-4 accent-primary-600"
              />
              <Icon name={option.icon} className="h-5 w-5 shrink-0 text-ink-900" />
              <span className="text-[14px] font-extrabold text-ink-900">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={lead.status === "loading"} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-[16px] font-extrabold text-white transition hover:bg-primary-500 disabled:opacity-60 sm:text-[17px]">
        {lead.status === "loading" ? "Sending..." : "Get Free Engine Quotes"}
        <Icon name="arrow-right" className="h-5 w-5" />
      </button>

      <p className="mt-3 text-[12px] leading-5 text-ink-700">A small number of suitable suppliers will contact you about your selected engine and service. Nearby suppliers are prioritised where available.</p>
      <p className="mt-2 flex items-start gap-2 text-[12px] leading-5 text-ink-700">
        <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-ink-800" />
        <span>We share your enquiry details only with a small number of suitable suppliers. Read our <a href="/contact" className="font-semibold text-primary-700 underline underline-offset-2">Privacy Policy</a>.</span>
      </p>
      <p className="mt-3 border-t border-[#aab3c2] pt-3 text-[12px] leading-5 text-ink-700">Engined connects buyers with suppliers. You agree the final price and all purchase or service terms directly with your chosen supplier.</p>
      <LeadStatus lead={lead} />
    </form>
  );
}

