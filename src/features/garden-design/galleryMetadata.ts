import { PhotoRecord } from '../garden-records/models/GardenRecordTypes';

export function galleryPhotoContextLabel(photo: PhotoRecord, tagCount = 0): string {
  const source = photoSourceLabel(photo.source);
  const savedContext = photo.plantId ? 'saved to plant' : 'unassigned';
  const tags = tagCount > 0 ? ` · ${tagCount} ${tagCount === 1 ? 'tag' : 'tags'}` : '';
  return `${source} · ${savedContext}${tags}`;
}

function photoSourceLabel(source: PhotoRecord['source']): string {
  if (source === 'camera') return 'Camera capture';
  if (source === 'library') return 'Photo library';
  if (source === 'import') return 'Imported photo';
  return 'Placeholder photo';
}
