import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { CareProfileRecord } from '../models/GardenRecordTypes';
import { mapCareProfile } from './rowMappers';

export type UpsertCareProfileInput = {
  id?: string;
  plantId: string;
  lightPreference?: string | null;
  wateringRhythm?: string | null;
  soilMoisturePreference?: string | null;
  fertilizerCadence?: string | null;
  pruningNotes?: string | null;
  harvestNotes?: string | null;
  locationNotes?: string | null;
  generalNotes?: string | null;
  source?: 'manual' | 'ai_assisted';
};

export class CareProfileRepository {
  async getProfileForPlant(plantId: string): Promise<CareProfileRecord | null> {
    if (Platform.OS === 'web') return null;
    const db = await getGardenDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM care_profiles WHERE plant_id = ? AND deleted_at IS NULL LIMIT 1;', [plantId]);
    return row ? mapCareProfile(row) : null;
  }

  async upsertProfile(input: UpsertCareProfileInput): Promise<CareProfileRecord> {
    if (Platform.OS === 'web') {
      return { ...input, id: input.id ?? `care-profile-${input.plantId}`, plantId: input.plantId, source: input.source ?? 'manual', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    const existing = await this.getProfileForPlant(input.plantId);
    const id = existing?.id ?? input.id ?? `care-profile-${input.plantId}`;
    if (existing) {
      await db.runAsync(
        `UPDATE care_profiles SET light_preference = ?, watering_rhythm = ?, soil_moisture_preference = ?, fertilizer_cadence = ?, pruning_notes = ?, harvest_notes = ?, location_notes = ?, general_notes = ?, source = ?, updated_at = ? WHERE id = ?;`,
        [clean(input.lightPreference), clean(input.wateringRhythm), clean(input.soilMoisturePreference), clean(input.fertilizerCadence), clean(input.pruningNotes), clean(input.harvestNotes), clean(input.locationNotes), clean(input.generalNotes), input.source ?? 'manual', now, id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO care_profiles (id, plant_id, light_preference, watering_rhythm, soil_moisture_preference, fertilizer_cadence, pruning_notes, harvest_notes, location_notes, general_notes, source, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [id, input.plantId, clean(input.lightPreference), clean(input.wateringRhythm), clean(input.soilMoisturePreference), clean(input.fertilizerCadence), clean(input.pruningNotes), clean(input.harvestNotes), clean(input.locationNotes), clean(input.generalNotes), input.source ?? 'manual', now, now, null]
      );
    }
    const row = await db.getFirstAsync<any>('SELECT * FROM care_profiles WHERE id = ?;', [id]);
    if (!row) throw new Error('Failed to save care profile.');
    return mapCareProfile(row);
  }
}

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const careProfileRepository = new CareProfileRepository();
