import { useCallback, useEffect, useState } from 'react';

import { PhotoRecord, PhotoTagRecord, PlantDetailRecord, PlantRecord } from '../models/GardenRecordTypes';
import { photoRepository } from '../repositories/PhotoRepository';
import { plantRepository } from '../repositories/PlantRepository';

export type AsyncState<T> = {
  data: T;
  loading: boolean;
  error?: Error;
  reload: () => void;
};

function useAsyncData<T>(load: () => Promise<T>, fallback: T, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    load()
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version, ...deps]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { data, loading, error, reload };
}

export function useHomeGardenRecords() {
  return useAsyncData(
    async () => {
      const [plants, attentionPlants, photos] = await Promise.all([
        plantRepository.listActivePlants(),
        plantRepository.listPlantsNeedingAttention(),
        photoRepository.listGalleryPhotos(),
      ]);
      return { plants, attentionPlants, photos };
    },
    { plants: [] as PlantRecord[], attentionPlants: [] as PlantRecord[], photos: [] as PhotoRecord[] }
  );
}

export function usePlantDetailRecord(plantId: string) {
  return useAsyncData<PlantDetailRecord | null>(() => plantRepository.getPlantDetail(plantId), null, [plantId]);
}

export function useGalleryRecords(filterPlantId?: string) {
  return useAsyncData(
    async () => {
      const [plants, photos] = await Promise.all([
        plantRepository.listActivePlants(),
        photoRepository.listGalleryPhotos(filterPlantId ? { plantId: filterPlantId } : undefined),
      ]);
      return { plants, photos };
    },
    { plants: [] as PlantRecord[], photos: [] as PhotoRecord[] },
    [filterPlantId]
  );
}


export function usePhotoTags(photoId?: string | null) {
  return useAsyncData<PhotoTagRecord[]>(() => (photoId ? photoRepository.listTagsForPhoto(photoId) : Promise.resolve([])), [], [photoId]);
}
