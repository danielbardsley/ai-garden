export type GardenZone = {
  type: 'USDA';
  value: string;
  label: string;
  source: 'estimated-from-temperature' | 'curated-coordinate-lookup' | 'setup';
  confidence: 'estimated';
};
