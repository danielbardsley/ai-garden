import { galleryPhotoContextLabel } from '../galleryMetadata';

describe('gallery photo metadata', () => {
  it('describes camera photos without exposing raw plant ids', () => {
    expect(galleryPhotoContextLabel({ id: 'photo-1', plantId: 'plant-1', localUri: 'file://photo.jpg', source: 'camera', isCoverCandidate: false }, 2)).toBe('Camera capture · saved to plant · 2 tags');
  });

  it('describes unassigned library photos', () => {
    expect(galleryPhotoContextLabel({ id: 'photo-1', localUri: 'file://photo.jpg', source: 'library', isCoverCandidate: false })).toBe('Photo library · unassigned');
  });
});
