// Plate look-up goes through our own /api/vrm route: the provider key stays on the server (VRM_API_KEY).

export type VehicleDetails = {
  vrm: string;
  make: string;
  model: string;
  year: string;
  engineCapacity: string;
  fuelType: string;
  colour: string;
};

export async function lookupVrm(rawReg: string): Promise<VehicleDetails> {
  const vrm = (rawReg || "").replace(/\s+/g, "").toUpperCase();
  if (!vrm) throw new Error("Please enter a vehicle registration number.");

  const url = `/api/vrm?vrm=${encodeURIComponent(vrm)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Please enter a valid UK registration number.");

  return {
    vrm,
    make: data.make || "",
    model: data.model || "",
    year: String(data.yearOfManufacture || ""),
    engineCapacity: String(data.engineCapacity || ""),
    fuelType: data.fuelType || "",
    colour: data.colour || data.color || "",
  };
}
