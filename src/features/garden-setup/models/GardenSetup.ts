export type SunExposure = 'shade' | 'partial' | 'full';

export type GardenSetup = {
  id: string;
  name: string;
  glyph?: string | null;
  locationLabel: string;
  hardinessZone?: string | null;
  sunExposure?: SunExposure | null;
  growingSpaces: string[];
  createdAt: string;
  updatedAt: string;
};

export type SaveGardenSetupInput = {
  name: string;
  glyph?: string | null;
  locationLabel: string;
  hardinessZone?: string | null;
  sunExposure?: SunExposure | null;
  growingSpaces: string[];
};
