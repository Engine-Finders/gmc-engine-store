import { sendLeadToCRM, toCrmLeadPayload, leadSourcePage } from "@/lib/leads";
import { buildLeadEmail } from "@/lib/leadEmail";

async function sendLeadEmail(payload: Record<string, unknown>, sourcePage: string) {
  const relayUrl = process.env.MAIL_RELAY_URL;
  if (!relayUrl) return { ok: false, error: "mail relay is not configured" };

  const email = buildLeadEmail(payload, sourcePage);

  const send = async (to: string | undefined, cc: string | undefined) => {
    if (!to) return { ok: false, error: "mail recipient is not configured" };

    try {
      const res = await fetch(relayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Relay-Secret": process.env.MAIL_RELAY_SECRET || "",
        },
        body: JSON.stringify({
          to,
          cc,
          fromAddress: process.env.MAIL_FROM_ADDRESS,
          fromName: process.env.MAIL_FROM_NAME,
          replyTo: email.replyTo,
          subject: email.subject,
          html: email.html,
          text: email.text,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const responseText = await res.text();
      if (!res.ok) return { ok: false, error: `relay responded ${res.status}: ${responseText.slice(0, 300)}` };

      // The relay may return a JSON error with HTTP 200. Treat that as a failure
      // instead of reporting a successful lead to the browser.
      try {
        const responseBody = JSON.parse(responseText) as { ok?: boolean; success?: boolean; status?: string; message?: string };
        if (responseBody.ok === false || responseBody.success === false || responseBody.status === "error") {
          return { ok: false, error: responseBody.message || "mail relay rejected the message" };
        }
      } catch {
        // A successful relay may return an empty or non-JSON response.
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  };

  const primaryResult = await send(process.env.MAIL_TO_ADDRESS, process.env.MAIL_CC_ADDRESS);

  if (!primaryResult.ok) console.error("lead email failed:", primaryResult.error);
  return primaryResult;
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
