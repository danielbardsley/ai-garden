export type SunExposure = 'shade' | 'partial' | 'full';
export type LocationSource = 'manual' | 'detected';
export type HardinessZoneSource = 'manual' | 'detected';

export type GardenSetup = {
  id: string;
  name: string;
  glyph?: string | null;
  locationLabel: string;
  locationSource?: LocationSource | null;
  latitude?: number | null;
  longitude?: number | null;
  hardinessZone?: string | null;
  hardinessZoneSource?: HardinessZoneSource | null;
  sunExposure?: SunExposure | null;
  growingSpaces: string[];
  createdAt: string;
  updatedAt: string;
};

export type SaveGardenSetupInput = {
  name: string;
  glyph?: string | null;
  locationLabel: string;
  locationSource?: LocationSource | null;
  latitude?: number | null;
  longitude?: number | null;
  hardinessZone?: string | null;
  hardinessZoneSource?: HardinessZoneSource | null;
  sunExposure?: SunExposure | null;
  growingSpaces: string[];
};
