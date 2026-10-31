import { SITE_HOST } from "@/lib/site";

/** Central Supabase lead helpers (same system as the garage sites). Server-only. */

export const LEAD_SOURCE = process.env.LEAD_SOURCE || SITE_HOST;

const WEBHOOK_URL = process.env.SUPABASE_WEBHOOK_URL || "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

type Payload = Record<string, unknown>;

function capacityToLitres(engineCapacity: unknown): string {
  const raw = engineCapacity ? String(engineCapacity).replace(/[^\d.]/g, "") : "";
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) return "";
  // The vehicle API returns cc (e.g. 1995); the CRM wants litres.
  return n >= 100 ? (n / 1000).toFixed(1) : String(n);
}

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());

/**
 * The page a lead was submitted from, as "domain/path" (no query string, so reg plates and other
 * personal bits never end up in it). Anything not on this site falls back to the bare domain.
 */
export function leadSourcePage(pageUrl?: unknown, referer?: string | null): string {
  for (const candidate of [pageUrl, referer]) {
    try {
      const u = new URL(String(candidate || ""));
      const host = u.hostname.replace(/^www\./, "");
      const isLocalDev = process.env.NODE_ENV !== "production" && host === "localhost";
      if (host !== LEAD_SOURCE && !isLocalDev) continue;
      const path = u.pathname.replace(/\/+$/, "");
      return `${isLocalDev ? u.host : LEAD_SOURCE}${path}`;
    } catch {
      /* try the next candidate */
    }
  }
  return LEAD_SOURCE;
}

/** Map whatever the form posts to the Edge Function's field names. */
export function toCrmLeadPayload(p: Payload = {}, sourcePage = LEAD_SOURCE) {
  const reg = str(p.vehicle_reg || p.vehicle_vrm).replace(/\s+/g, "").toUpperCase();
  const vrm = str(p.vehicle_vrm || p.vehicle_reg).replace(/\s+/g, "").toUpperCase();
  return {
    name: str(p.name),
    email: str(p.email),
    number: str(p.number || p.phone),
    postcode: str(p.postcode),
    vehicle_brand: str(p.vehicle_brand || p.brand),
    vehicle_model: str(p.vehicle_model || p.model),
    vehicle_reg: reg,
    vehicle_vrm: vrm,
    vehicle_series: str(p.vehicle_series || p.series),
    engine_capacity: capacityToLitres(p.engine_capacity),
    fuel_type: str(p.fuel_type),
    vehicle_part: str(p.vehicle_part) || "Engine",
    description: str(p.description),
    source: LEAD_SOURCE,
    source_page: sourcePage,
  };
}

/** POST a lead to the central receive-lead Edge Function. Never throws. */
export async function sendLeadToCRM(crmPayload: ReturnType<typeof toCrmLeadPayload>): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  if (!WEBHOOK_URL || !ANON_KEY) return { ok: false, error: "Supabase is not configured" };
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
      body: JSON.stringify(crmPayload),
      signal: AbortSignal.timeout(15000),
    });
    // 409 = the Edge Function already has this lead (duplicate window): nothing to retry.
    if (res.status === 409) return { ok: true, duplicate: true };
    if (!res.ok) return { ok: false, error: `receive-lead responded ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
