export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Oti",
  "Savannah",
  "North East",
  "Western North",
] as const;

export type RegionName = (typeof GHANA_REGIONS)[number];

const NEIGHBORHOOD_MAP: Record<string, RegionName> = {
  // Greater Accra
  Cantonments: "Greater Accra",
  "Airport Residential": "Greater Accra",
  Labone: "Greater Accra",
  Osu: "Greater Accra",
  "East Legon": "Greater Accra",
  Spintex: "Greater Accra",
  Dzorwulu: "Greater Accra",
  Abelemkpe: "Greater Accra",
  "Roman Ridge": "Greater Accra",
  Ridge: "Greater Accra",
  Tesano: "Greater Accra",
  Achimota: "Greater Accra",
  Tema: "Greater Accra",
  Madina: "Greater Accra",
  Adenta: "Greater Accra",
  Lapaz: "Greater Accra",
  Weija: "Greater Accra",
  "McCarthy Hill": "Greater Accra",

  // Central
  Kasoa: "Central",

  // Ashanti
  Kumasi: "Ashanti",
  Ahodwo: "Ashanti",

  // Western
  Takoradi: "Western",
  Tarkwa: "Western",
};

export function getRegionForLocation(
  location: string | null | undefined
): string {
  // 🛡️ GUARDRAIL: If location is missing, return 'Unknown' immediately.
  if (!location) return "Unknown";

  const normalized = location.toLowerCase().trim();

  // Build a lowercase lookup for neighborhoods so we can do case-insensitive matches.
  const lowerNeighborhoodMap: Record<string, RegionName> = {};
  for (const n in NEIGHBORHOOD_MAP) {
    lowerNeighborhoodMap[n.toLowerCase()] = NEIGHBORHOOD_MAP[n];
  }

  // Exact neighborhood match
  if (lowerNeighborhoodMap[normalized]) return lowerNeighborhoodMap[normalized];

  // If the provided location contains a known neighborhood name, return its region
  for (const nb in lowerNeighborhoodMap) {
    if (normalized.includes(nb)) return lowerNeighborhoodMap[nb];
  }

  // If the provided location contains a region name, return it
  for (const region of GHANA_REGIONS) {
    if (normalized.includes(region.toLowerCase())) return region;
  }

  return "Other"; // Default fallback
}
