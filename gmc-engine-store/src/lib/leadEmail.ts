import { randomUUID } from "node:crypto";
import { LEAD_SOURCE } from "@/lib/leads";
import { SITE_HOST, SITE_NAME, SITE_URL } from "@/lib/site";

type LeadPayload = Record<string, unknown>;

const LOGO_PATH = "/images/brands/logo.png";
const ENGINE_PATH = "/images/listings/engine.png";
const NOT_PROVIDED = "Not provided";

const UNIVERSAL_EMAIL_TEMPLATE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Quote Request</title></head><body style="margin:0;padding:18px 8px;background:#eaf0f7;font-family:Arial,Helvetica,sans-serif;color:#101b2d"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(17,39,70,.16)"><tr><td style="background:#071d37;padding:0;color:#fff"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top" style="padding:20px 8px 18px 24px"><img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" width="96" style="display:block;width:96px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px"><tr><td width="38" height="38" align="center" valign="middle" style="width:38px;height:38px;background:#0b9fea;border:1px solid #61c7fb;border-radius:8px;font-size:21px;line-height:38px;color:#fff">&#9993;</td><td style="padding-left:11px"><div style="font-size:24px;line-height:28px;font-weight:700;color:#fff">New Quote Request</div><div style="font-size:14px;line-height:19px;color:#d6e8f7;padding-top:3px">A new enquiry has been submitted from your website.</div></td></tr></table></td><td width="170" align="right" valign="bottom" style="width:170px;padding:10px 14px 0 0"><img src="{{ENGINE_IMAGE_URL}}" alt="Engine" width="150" style="display:block;width:150px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none"></td></tr></table></td></tr><tr><td style="padding:18px 24px 8px;background:#fff">{{LEAD_CARD}}{{VEHICLE_CARD}}{{SOURCE_CARD}}</td></tr><tr><td style="padding:18px 24px;background:#071d37;color:#fff"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="font-size:14px;line-height:20px;font-weight:700">Lead Reference: <span style="color:#42c8fb">{{LEAD_REFERENCE}}</span></td><td align="right" style="font-size:13px;line-height:20px;color:#eef7ff">&#128197; Received: {{RECEIVED_UK}}</td></tr></table></td></tr></table></td></tr></table></body></html>`;

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function text(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function displayValue(value: unknown) {
  return text(value) || NOT_PROVIDED;
}

function row(label: string, value: string) {
  return `<tr><td valign="top" width="39%" style="padding:9px 12px 9px 14px;background:#f4f8fd;color:#101b2d;border-bottom:1px solid #b9cce2;font-size:14px;line-height:20px;font-weight:700">${escapeHtml(label)}</td><td valign="top" style="padding:9px 14px;background:#fff;color:#172238;border-bottom:1px solid #b9cce2;font-size:14px;line-height:20px;overflow-wrap:anywhere">${escapeHtml(displayValue(value)).replace(/\r?\n/g, "<br>")}</td></tr>`;
}

function linkRow(label: string, value: string, href: string) {
  const safeValue = displayValue(value);
  if (safeValue === NOT_PROVIDED || !href) return row(label, safeValue);
  return `<tr><td valign="top" width="39%" style="padding:9px 12px 9px 14px;background:#f4f8fd;color:#101b2d;border-bottom:1px solid #b9cce2;font-size:14px;line-height:20px;font-weight:700">${escapeHtml(label)}</td><td valign="top" style="padding:9px 14px;background:#fff;border-bottom:1px solid #b9cce2;font-size:14px;line-height:20px;overflow-wrap:anywhere"><a href="${escapeHtml(href)}" style="color:#075ccf;text-decoration:underline;font-weight:700">${escapeHtml(safeValue)}</a></td></tr>`;
}

function registrationRow(value: string) {
  const registration = text(value);
  if (!registration) return row("Vehicle Reg", "");
  return `<tr><td valign="top" width="39%" style="padding:9px 12px 9px 14px;background:#f4f8fd;color:#101b2d;border-bottom:1px solid #b9cce2;font-size:14px;line-height:20px;font-weight:700">Vehicle Reg</td><td valign="top" style="padding:9px 14px;background:#fff;border-bottom:1px solid #b9cce2"><span style="display:inline-block;min-width:126px;padding:3px 12px;background:#ffda18;border:1px solid #bf9100;border-radius:4px;color:#111827;font-size:18px;line-height:22px;font-weight:800;letter-spacing:1px;text-align:center">${escapeHtml(registration.toUpperCase())}</span></td></tr>`;
}

function sectionCard(title: string, icon: string, rows: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;border:1px solid #93b0d1;border-radius:10px;overflow:hidden"><tr><td style="padding:10px 14px;background:#071d37;color:#fff;font-size:18px;line-height:22px;font-weight:700">${icon}<span style="padding-left:10px">${escapeHtml(title)}</span></td></tr><tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">${rows}</table></td></tr></table>`;
}

function formatEngineCapacity(value: unknown) {
  const raw = text(value).replace(/,/g, "");
  if (!raw) return "";
  const litreMatch = raw.match(/^(\d+(?:\.\d{1,2})?)\s*l(?:itre|iter)?$/i);
  if (litreMatch) {
    const litres = Number(litreMatch[1]);
    return litres >= 0.5 && litres <= 10 ? `${litres.toFixed(1)} L` : "";
  }
  const ccMatch = raw.match(/^(\d{3,5})(?:\s*cc|\s*cm3)?$/i);
  if (!ccMatch) return "";
  const cc = Number(ccMatch[1]);
  return cc >= 500 && cc <= 10000 ? `${cc.toLocaleString("en-GB")} cc (${(cc / 1000).toFixed(1)} L)` : "";
}

function receivedAtUk() {
  return `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date())} (UK)`;
}

function formatHtmlForMailTransport(html: string) {
  return html.replace(/>\s*</g, ">\r\n<");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sourcePageUrl(sourcePage: string) {
  try {
    const candidate = new URL(sourcePage.startsWith("http") ? sourcePage : `https://${sourcePage}`);
    const host = candidate.hostname.replace(/^www\./, "");
    return candidate.protocol === "https:" && host === SITE_HOST ? candidate.toString() : "";
  } catch {
    return "";
  }
}

function additionalInformationValues(payload: LeadPayload) {
  const values: string[] = [];
  const product = text(payload.vehicle_part || payload.product || payload.enquiry_type);
  const note = text(payload.description || payload.additional_information || payload.note);
  const engine = [formatEngineCapacity(payload.engine_capacity || payload.engine_capacity_cc), text(payload.fuel_type), text(payload.engine_code || payload.engine || payload.engine_model)].filter(Boolean);

  if (product) values.push(`Product enquiry: ${product}`);
  if (engine.length) values.push(`Engine specifications: ${engine.join(" · ")}`);
  if (note) values.push(`Customer notes: ${note}`);
  return values;
}

function subjectParts(payload: LeadPayload) {
  const clean = (value: unknown) => text(value).replace(/[\r\n|]+/g, " ").replace(/\s+/g, " ").trim();
  const vehicle = [clean(payload.vehicle_brand || payload.brand), clean(payload.vehicle_series || payload.model)].filter(Boolean).join(" ");
  const reg = clean(payload.vehicle_vrm || payload.vehicle_reg).replace(/\s+/g, "").toUpperCase();
  return [vehicle, reg].filter(Boolean);
}

export function buildLeadEmail(payload: LeadPayload, sourcePage: string) {
  const name = text(payload.name);
  const email = text(payload.email);
  const phone = text(payload.number || payload.phone);
  const postcode = text(payload.postcode);
  const registration = text(payload.vehicle_vrm || payload.vehicle_reg).replace(/\s+/g, "").toUpperCase();
  const make = text(payload.vehicle_brand || payload.brand);
  const model = text(payload.vehicle_series || payload.model);
  const year = text(payload.year || payload.vehicle_year);
  const capacity = formatEngineCapacity(payload.engine_capacity || payload.engine_capacity_cc);
  const fuel = text(payload.fuel_type);
  const pageUrl = sourcePageUrl(sourcePage);
  const reference = `#GMC-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  const received = receivedAtUk();
  const subjectVehicle = subjectParts(payload);
  const subject = [`New Lead`, SITE_NAME, ...subjectVehicle].join(" ");
  const logoUrl = new URL(LOGO_PATH, SITE_URL).toString();
  const engineImageUrl = new URL(ENGINE_PATH, SITE_URL).toString();

  const additionalInformation = additionalInformationValues(payload).join("\n");
  const leadRows = [
    row("Name", name),
    linkRow("Email", email, validEmail(email) ? `mailto:${encodeURIComponent(email)}` : ""),
    linkRow("Phone Number", phone, phone ? `tel:${encodeURIComponent(phone.replace(/\s+/g, ""))}` : ""),
    row("Postcode", postcode),
    row("Additional Information", additionalInformation),
  ].join("");

  const vehicleRows = [
    registrationRow(registration),
    row("Vehicle Make", make),
    row("Vehicle Model", model),
    row("Vehicle Year", year),
    row("Engine Capacity", capacity),
    row("Fuel Type", fuel),
  ].join("");

  const sourceRows = [
    linkRow("Source", SITE_HOST, `https://${SITE_HOST}`),
    pageUrl ? linkRow("Page", sourcePage, pageUrl) : row("Page", sourcePage || LEAD_SOURCE),
  ].join("");

  const html = formatHtmlForMailTransport(
    UNIVERSAL_EMAIL_TEMPLATE
      .replace(/{{SITE_NAME}}/g, escapeHtml(SITE_NAME))
      .replace("{{LOGO_URL}}", escapeHtml(logoUrl))
      .replace("{{ENGINE_IMAGE_URL}}", escapeHtml(engineImageUrl))
      .replace("{{LEAD_CARD}}", sectionCard("LEAD DETAILS", "&#128100;", leadRows))
      .replace("{{VEHICLE_CARD}}", sectionCard("VEHICLE DETAILS", "&#128663;", vehicleRows))
      .replace("{{SOURCE_CARD}}", sectionCard("SOURCE", "&#128279;", sourceRows))
      .replace("{{LEAD_REFERENCE}}", escapeHtml(reference))
      .replace("{{RECEIVED_UK}}", escapeHtml(received)),
  );

  const textBody = [
    "NEW QUOTE REQUEST",
    SITE_NAME,
    "",
    "LEAD DETAILS",
    `Name: ${displayValue(name)}`,
    `Email: ${displayValue(email)}`,
    `Phone Number: ${displayValue(phone)}`,
    `Postcode: ${displayValue(postcode)}`,
    `Additional Information: ${displayValue(additionalInformation)}`,
    "",
    "VEHICLE DETAILS",
    `Vehicle Reg: ${displayValue(registration)}`,
    `Vehicle Make: ${displayValue(make)}`,
    `Vehicle Model: ${displayValue(model)}`,
    `Vehicle Year: ${displayValue(year)}`,
    `Engine Capacity: ${displayValue(capacity)}`,
    `Fuel Type: ${displayValue(fuel)}`,
    "",
    "SOURCE INFORMATION",
    `Source: ${SITE_HOST} (${SITE_URL})`,
    `Page: ${sourcePage || LEAD_SOURCE}`,
    "",
    `Lead reference: ${reference}`,
    `Received: ${received}`,
  ].join("\n");

  return { html, text: textBody, subject, replyTo: validEmail(email) ? email : undefined };
}



