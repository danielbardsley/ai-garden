export type PlantObservation = {
  id: string;
  seasonYear: number;
  locationLabel?: string;
  plantName?: string;
  varietyName?: string;
  plantedAt?: string;
  notes?: string;
  photoIds: string[];
  aiLabels: PlantPhotoLabel[];
};

export type PlantPhotoLabel = {
  label: string;
  confidence?: number;
  source: 'ai' | 'manual';
};
