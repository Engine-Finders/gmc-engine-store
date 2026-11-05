import brandLogos from "@/data/brandLogos.json";

function brandKey(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function brandLogoForName(name: string): string {
  return (brandLogos as Record<string, string>)[brandKey(name)] || "";
}
