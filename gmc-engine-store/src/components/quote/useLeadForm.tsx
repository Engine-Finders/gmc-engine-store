"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export type LeadState = {
  status: "idle" | "loading" | "success" | "error";
  error: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  dismiss: () => void;
};

// Submits a quote form to /api/send-lead. Inputs are read by `name`:
// name, number, email, postcode, description, vehicle_vrm and the vehicle_* / year fields.
export default function useLeadForm(source = "quote-popup"): LeadState {
  const [status, setStatus] = useState<LeadState["status"]>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    setError("");
    try {
      const payload = {
        ...Object.fromEntries(new FormData(form)),
        page_url: window.location.href,
        lead_source: source,
      };
      const res = await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again in a moment.");
    }
  }

  return { status, error, handleSubmit, dismiss: () => setStatus("idle") };
}

function LeadMessage({ lead }: { lead: LeadState }) {
  if (lead.status === "success")
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Enquiry submitted"
        className="fixed inset-x-0 top-0 z-[110] flex h-dvh items-center justify-center bg-black/50 p-4 backdrop-blur-md"
        onClick={lead.dismiss}
      >
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-2xl text-white" aria-hidden>
            ✓
          </span>
          <p className="mt-4 text-xl font-extrabold text-ink-900">Your Enquiry Has Been Submitted</p>
          <p className="mt-2 text-sm text-ink-900">A specialist will be in touch soon.</p>
          <button type="button" onClick={lead.dismiss} className="mt-5 rounded-lg bg-primary-600 px-8 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-primary-500">
            Close
          </button>
        </div>
      </div>
    );
  if (lead.status === "error")
    return (
      <p role="alert" className="mt-3 text-center text-sm font-semibold text-red-500">
        {lead.error}
      </p>
    );
  return null;
}

// Rendered inside every lead form. Carries the hidden honeypot field: bots fill it, people never see it, and
// /api/send-lead drops any lead that has it filled in.
export function LeadStatus({ lead }: { lead: LeadState }) {
  return (
    <>
      <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <LeadMessage lead={lead} />
    </>
  );
}
