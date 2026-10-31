// Server-side proxy for the vehicle-data (plate look-up) provider, so the API key never reaches the browser.
// The key lives in the VRM_API_KEY environment variable (Vercel project settings / .env.local).
const API_URL = "https://api.checkcardetails.co.uk/vehicledata/vehicleregistration";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30; // look-ups per IP per window (per server instance: a brake, not a guarantee)
const hits = new Map<string, { start: number; n: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    return false;
  }
  entry.n += 1;
  return entry.n > MAX_PER_WINDOW;
}

// Only this site's own pages may call the route (blocks hot-linking from other sites and plain scripts).
function fromOwnSite(request: Request) {
  const host = request.headers.get("host") || "";
  if (/^localhost(:\d+)?$/.test(host)) return true;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "same-site";
  try {
    return new URL(request.headers.get("referer") || "").host === host;
  } catch {
    return false;
  }
}

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  if (!fromOwnSite(request)) return json({ message: "Not allowed." }, 403);

  const key = process.env.VRM_API_KEY;
  if (!key) {
    console.error("vrm lookup: VRM_API_KEY is not set");
    return json({ message: "Registration look-up is not available right now." }, 503);
  }

  const vrm = (new URL(request.url).searchParams.get("vrm") || "").replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z0-9]{2,8}$/.test(vrm)) return json({ message: "Please enter a valid UK registration number." }, 400);

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return json({ message: "Too many look-ups. Please try again in a few minutes." }, 429);

  try {
    const res = await fetch(`${API_URL}?apikey=${encodeURIComponent(key)}&vrm=${encodeURIComponent(vrm)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return json({ message: data.message || "Please enter a valid UK registration number." }, res.status === 429 ? 429 : 404);
    // pass on only what the site uses
    return json({
      make: data.make || "",
      model: data.model || "",
      yearOfManufacture: data.yearOfManufacture || "",
      engineCapacity: data.engineCapacity || "",
      fuelType: data.fuelType || "",
      colour: data.colour || data.color || "",
    });
  } catch (err) {
    console.error("vrm lookup failed:", (err as Error).message);
    return json({ message: "Registration look-up is not available right now." }, 502);
  }
}
