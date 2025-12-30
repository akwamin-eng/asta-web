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
  "Western North"
] as const;

export type RegionName = typeof GHANA_REGIONS[number];

const NEIGHBORHOOD_MAP: Record<string, RegionName> = {
  "Cantonments": "Greater Accra",
  "Airport Residential": "Greater Accra",
  "Labone": "Greater Accra",
  "Osu": "Greater Accra",
  "East Legon": "Greater Accra",
  "Spintex": "Greater Accra",
  "Dzorwulu": "Greater Accra",
  "Abelemkpe": "Greater Accra",
  "Roman Ridge": "Greater Accra",
  "Ridge": "Greater Accra",
  "Tesano": "Greater Accra",
  "Achimota": "Greater Accra",
  "Tema": "Greater Accra",
  "Madina": "Greater Accra",
  "Adenta": "Greater Accra",
  "Lapaz": "Greater Accra",
  "Weija": "Greater Accra",
  "McCarthy Hill": "Greater Accra",
  "Kasoa": "Central",
  "Kumasi": "Ashanti",
  "Ahodwo": "Ashanti",
  "Takoradi": "Western",
  "Tarkwa": "Western"
};

export const getRegionForLocation = (location: string): RegionName => {
  const exact = NEIGHBORHOOD_MAP[location];
  if (exact) return exact;

  const lowerLoc = location.toLowerCase();
  if (lowerLoc.includes("accra") || lowerLoc.includes("legon") || lowerLoc.includes("tema")) return "Greater Accra";
  if (lowerLoc.includes("kumasi")) return "Ashanti";
  if (lowerLoc.includes("takoradi")) return "Western";

  return "Greater Accra";
};
