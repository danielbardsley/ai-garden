import { PhotoRecord, PlantRecord } from './models/GardenRecordTypes';

export function relDays(value?: string | null) {
  if (!value) return '—';
  const today = new Date('2026-05-07T12:00:00');
  const then = new Date(`${value}T12:00:00`);
  const days = Math.round((today.getTime() - then.getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 31) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export function fmtDate(value: string, options: { short?: boolean; year?: boolean } = {}) {
  const date = new Date(`${value}T12:00:00`);
  if (options.short) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(options.year ? { year: 'numeric' } : {}),
  });
}

export function plantSwatch(plant: PlantRecord) {
  return [plant.primaryColor ?? '#7da259', plant.secondaryColor ?? plant.primaryColor ?? '#3e5c3a'];
}

export function latestPhotoForPlant(plant: PlantRecord, photos?: PhotoRecord[]) {
  return photos?.find((photo) => photo.id === plant.coverPhotoId || photo.plantId === plant.id);
}
