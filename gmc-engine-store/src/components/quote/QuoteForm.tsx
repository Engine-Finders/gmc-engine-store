"use client";

import { useEffect, useState } from "react";
import UkFlag from "../UkFlag";
import Icon from "../Icon";
import useLeadForm, { LeadStatus } from "./useLeadForm";
import { lookupVrm } from "@/lib/vrmLookup";
import type { VehicleDetails } from "@/lib/vrmLookup";

export type QuoteEngineDetails = {
  brand: string;
  code: string;
  displacement?: string;
  fuel?: string;
  image?: string;
  href?: string;
};

/** What opens the quote form: an optional heading, vehicle lookup, selected engine and enquiry note. */
export type QuoteOptions = {
  heading?: string;
  reg?: string;
  postcode?: string;
  engineCode?: string;
  part?: string;
  note?: string;
  engine?: QuoteEngineDetails;
  requestService?: boolean;
  service?: "Replacement engine" | "Supply-only engine" | "Supply and fit" | "Engine rebuild";
};

const FIELD =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-base sm:text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25";

const litres = (cc: string) => {
  const n = Number(cc);
  return n > 0 ? `${(n / 1000).toFixed(1)}L` : cc;
};

/**
 * The lead form: registration lookup, then contact details. Used by the site-wide quote popup and the
 * contact page, so both send the same payload to /api/send-lead. `idPrefix` keeps field ids unique when
 * the popup is open on top of a page that already has a form.
 */
export default function QuoteForm({ opts = {}, source = "quote-popup", idPrefix = "quote" }: { opts?: QuoteOptions; source?: string; idPrefix?: string }) {
  const lead = useLeadForm(source);
  const [reg, setReg] = useState(opts.reg || "");
  const [engineCode, setEngineCode] = useState(opts.engineCode || "");
  const [service, setService] = useState(opts.service || "");
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState("");

  async function lookup(plate: string) {
    if (!plate.trim()) return;
    setLooking(true);
    setLookupError("");
    try {
      const v = await lookupVrm(plate);
      setVehicle(v);
      setReg(v.vrm);
    } catch (err) {
      setVehicle(null);
      setLookupError((err as Error).message || "Please enter a valid UK registration number.");
    } finally {
      setLooking(false);
    }
  }

  // a plate handed in by the page's own registration box is looked up straight away
  useEffect(() => {
    if (opts.reg) void lookup(opts.reg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // custom fields clear their own state when the form resets (after a successful send)
  function onReset() {
    setReg("");
    setEngineCode("");
    setService("");
    setVehicle(null);
    setLookupError("");
  }

  const id = (n: string) => `${idPrefix}-${n}`;

  return (
    <form onSubmit={lead.handleSubmit} onReset={onReset} className="space-y-3">
      {opts.engineCode ? (
        <div className="rounded-lg border border-primary-200 bg-[#f4f7fc] px-3 py-2.5">
          <label htmlFor={id("engine-code")} className="mb-1 block text-sm font-bold text-ink-900">Engine code</label>
          <input
            id={id("engine-code")}
            type="text"
            value={engineCode}
            onChange={(event) => setEngineCode(event.target.value.toUpperCase())}
            autoComplete="off"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400 sm:text-sm"
          />
          <p className="mt-1 text-[12px] text-ink-600">Engine code carried over from your supplier search.</p>
        </div>
      ) : (
        <div>
          <label htmlFor={id("reg")} className="mb-1 block text-sm font-bold text-ink-900">Vehicle registration</label>
          <div className="flex items-stretch gap-2">
            <span className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-line bg-white">
              <span className="flex shrink-0 items-center gap-1.5 border-r border-line bg-[#eef1f6] px-2.5">
                <UkFlag className="h-4 w-6 rounded-sm" />
                <span className="text-[11px] font-bold text-ink-700">UK</span>
              </span>
              <input
                id={id("reg")}
                type="text"
                value={reg}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                autoComplete="off"
                placeholder="e.g. AB12 CDE"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base font-semibold tracking-wide text-ink-900 outline-none placeholder:text-ink-400 sm:text-sm"
              />
            </span>
            <button
              type="button"
              disabled={looking}
              onClick={() => lookup(reg)}
              className="shrink-0 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
            >
              {looking ? "Checking..." : "Look Up"}
            </button>
          </div>
          {lookupError && <p role="alert" className="mt-1.5 text-[12.5px] font-semibold text-red-600">{lookupError}</p>}
        </div>
      )}

      {vehicle && (
        <div className="rounded-lg border border-primary-200 bg-[#f4f7fc] px-3 py-2.5 text-[13px] text-ink-800">
          <p className="font-bold text-ink-900">{[vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.vrm}</p>
          <p className="mt-0.5 text-ink-500">
            {[vehicle.year, vehicle.engineCapacity && litres(vehicle.engineCapacity), vehicle.fuelType, vehicle.colour].filter(Boolean).join(" · ")}
          </p>
        </div>
      )}

      {/* vehicle details travel with the lead */}
      <input type="hidden" name="vehicle_vrm" value={vehicle?.vrm || reg.replace(/\s+/g, "")} />
      <input type="hidden" name="vehicle_brand" value={vehicle?.make || ""} />
      <input type="hidden" name="vehicle_series" value={vehicle?.model || ""} />
      <input type="hidden" name="year" value={vehicle?.year || ""} />
      <input type="hidden" name="engine_capacity" value={vehicle?.engineCapacity || ""} />
      <input type="hidden" name="fuel_type" value={vehicle?.fuelType || ""} />
      <input type="hidden" name="vehicle_part" value={opts.part || "Engine"} />
      {(opts.engine || engineCode) && (
        <>
          <input type="hidden" name="engine_brand" value={opts.engine?.brand || ""} />
          <input type="hidden" name="engine_code" value={opts.engine?.code || engineCode} />
          <input type="hidden" name="engine_displacement" value={opts.engine?.displacement || ""} />
          <input type="hidden" name="engine_fuel" value={opts.engine?.fuel || ""} />
        </>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className="mb-1 block text-sm font-bold text-ink-900">Name</label>
          <input id={id("name")} name="name" required autoComplete="name" placeholder="Your name" className={FIELD} />
        </div>
        <div>
          <label htmlFor={id("number")} className="mb-1 block text-sm font-bold text-ink-900">Phone</label>
          <input id={id("number")} name="number" type="tel" required autoComplete="tel" placeholder="Your phone number" className={FIELD} />
        </div>
        <div>
          <label htmlFor={id("email")} className="mb-1 block text-sm font-bold text-ink-900">Email</label>
          <input id={id("email")} name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={FIELD} />
        </div>
        <div>
          <label htmlFor={id("postcode")} className="mb-1 block text-sm font-bold text-ink-900">Postcode</label>
          <input id={id("postcode")} name="postcode" defaultValue={opts.postcode || ""} autoComplete="postal-code" placeholder="Delivery postcode" className={FIELD} />
        </div>
      </div>

      {(opts.engine || opts.requestService) && (
        <div>
          <label htmlFor={id("service")} className="mb-1 block text-sm font-bold text-ink-900">Service Or Replacement Requirement</label>
          <select
            id={id("service")}
            name="service"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            className={FIELD}
          >
            <option value="">Select An Option</option>
            <option value="Replacement engine">Replacement Engine</option>
            <option value="Supply-only engine">Supply-Only Engine</option>
            <option value="Supply and fit">Supply And Fit</option>
            <option value="Engine rebuild">Engine Rebuild</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor={id("description")} className="mb-1 block text-sm font-bold text-ink-900">Enquiry <span className="font-normal text-ink-500">(optional)</span></label>
        <textarea id={id("description")} name="description" rows={3} defaultValue={opts.note || ""} placeholder="Tell us the engine or vehicle you need, or anything we should know." className={FIELD} />
      </div>

      <button
        type="submit"
        disabled={lead.status === "loading"}
        className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 text-[15px] font-bold text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
      >
        {lead.status === "loading" ? "Sending..." : "Get My Free Quote"}
        <Icon name="arrow-right" className="h-5 w-5" />
      </button>
      <LeadStatus lead={lead} />
    </form>
  );
}
