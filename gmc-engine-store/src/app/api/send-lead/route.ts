import { sendLeadToCRM, toCrmLeadPayload, leadSourcePage, LEAD_SOURCE } from "@/lib/leads";
import { SITE_NAME } from "@/lib/site";

const esc = (v: unknown) =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sendLeadEmail(payload: Record<string, unknown>, sourcePage: string) {
  const relayUrl = process.env.MAIL_RELAY_URL;
  if (!relayUrl) return { ok: false, error: "mail relay is not configured" };

  const { page_url: _pageUrl, honeypot: _honeypot, ...fields } = payload;
  const rows = Object.entries({ ...fields, source: LEAD_SOURCE, source_page: sourcePage })
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `<tr><td style="font-weight:bold;padding:4px 12px 4px 0;">${esc(key)}</td><td>${esc(value)}</td></tr>`)
    .join("");

  try {
    const res = await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Relay-Secret": process.env.MAIL_RELAY_SECRET || "",
      },
      body: JSON.stringify({
        to: process.env.MAIL_TO_ADDRESS,
        cc: process.env.MAIL_CC_ADDRESS,
        fromAddress: process.env.MAIL_FROM_ADDRESS,
        fromName: process.env.MAIL_FROM_NAME,
        subject: `New Quote Request - ${SITE_NAME}`,
        html: `<h2>New Quote Request</h2><table>${rows}</table>`,
      }),
      signal: AbortSignal.timeout(20000),
    });
    return res.ok ? { ok: true } : { ok: false, error: `relay responded ${res.status}` };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ status: "error", message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend it worked, send nothing.
  if (payload.honeypot) return Response.json({ status: "success" });

  const sourcePage = leadSourcePage(payload.page_url, request.headers.get("referer"));
  const crmPayload = toCrmLeadPayload(payload, sourcePage);
  if (!crmPayload.email && !crmPayload.number) {
    return Response.json({ status: "error", message: "Email or phone number is required." }, { status: 400 });
  }

  // Email (+ cc) and the central CRM both get the lead, independently.
  const [emailResult, crmResult] = await Promise.all([sendLeadEmail(payload, sourcePage), sendLeadToCRM(crmPayload)]);

  if (!emailResult.ok) console.error("lead email failed:", emailResult.error);
  if (!crmResult.ok) console.error("lead CRM failed:", crmResult.error);

  if (!emailResult.ok && !crmResult.ok) {
    return Response.json({ status: "error", message: "Failed to submit lead." }, { status: 502 });
  }

  return Response.json({ status: "success" });
}
