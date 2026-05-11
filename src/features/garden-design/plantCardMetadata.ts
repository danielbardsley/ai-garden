import { PhotoRecord, PlantRecord } from '../garden-records/models/GardenRecordTypes';
import { fmtDate } from '../garden-records/viewModels';

export function plantCardSubheader(plant: PlantRecord, photos: PhotoRecord[]): string {
  const plantPhotos = photos.filter((photo) => photo.plantId === plant.id);
  if (plantPhotos.length > 0) {
    const latest = latestPhotoByCapturedOn(plantPhotos);
    const latestDate = latest?.capturedOn ? ` · latest ${fmtDate(latest.capturedOn, { short: true })}` : '';
    return `${plantPhotos.length} ${plantPhotos.length === 1 ? 'photo' : 'photos'}${latestDate}`;
  }
  if (plant.nextActionLabel) return plant.nextActionLabel;
  if (plant.statusLabel) return plant.statusLabel;
  return 'No photos yet';
}

function latestPhotoByCapturedOn(photos: PhotoRecord[]): PhotoRecord | undefined {
  return [...photos].sort((left, right) => (right.capturedOn ?? '').localeCompare(left.capturedOn ?? ''))[0];
}
