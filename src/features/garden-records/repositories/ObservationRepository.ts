import { getGardenDatabase } from '../../storage/database';
import { ObservationRecord } from '../models/GardenRecordTypes';
import { mapObservation } from './rowMappers';

export type CreatePhotoObservationInput = {
  id: string;
  plantId: string;
  seasonId?: string | null;
  locationId?: string | null;
  observedOn: string;
  observedAt: string;
  note?: string | null;
  mood?: string | null;
};

export class ObservationRepository {
  async createPhotoObservation(input: CreatePhotoObservationInput): Promise<ObservationRecord> {
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO observations (
        id, plant_id, season_id, location_id, observed_on, observed_at, title, note,
        kind, mood, height_value, height_unit, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.plantId,
        input.seasonId ?? 'season-2026',
        input.locationId ?? null,
        input.observedOn,
        input.observedAt,
        'Photo log',
        input.note ?? 'New photo captured from camera.',
        'photo',
        input.mood ?? 'neutral',
        null,
        null,
        now,
        now,
        null,
      ]
    );
    const row = await db.getFirstAsync<any>('SELECT * FROM observations WHERE id = ?;', [input.id]);
    if (!row) throw new Error('Failed to create observation.');
    return mapObservation(row);
  }
}

export const observationRepository = new ObservationRepository();
