// Live domain by default (the www host: engined.co.uk 308-redirects to it) (never localhost, so a missing env var can't leak into canonicals / leads).
// Override per environment with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.engined.co.uk").replace(/\/+$/, "");
export const SITE_HOST = new URL(SITE_URL).hostname.replace(/^www\./, "");
export const SITE_NAME = "GMC Engine Store";
export const SITE_PHONE = process.env.NEXT_PUBLIC_SITE_PHONE || "";
