import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { CareEventRecord } from '../models/GardenRecordTypes';
import { mapCareEvent } from './rowMappers';

export type CreateCareEventInput = {
  id: string;
  plantId: string;
  eventType: string;
  eventDate: string;
  note?: string | null;
};

export class CareEventRepository {
  async createCareEvent(input: CreateCareEventInput): Promise<CareEventRecord> {
    if (Platform.OS === 'web') {
      return { id: input.id, plantId: input.plantId, eventType: input.eventType, eventDate: input.eventDate, note: input.note ?? null, source: 'manual' };
    }
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO care_events (id, plant_id, observation_id, event_type, event_date, note, source, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [input.id, input.plantId, null, input.eventType, input.eventDate, input.note?.trim() || null, 'manual', now, now, null]
    );
    const row = await db.getFirstAsync<any>('SELECT * FROM care_events WHERE id = ?;', [input.id]);
    if (!row) throw new Error('Failed to create care event.');
    return mapCareEvent(row);
  }
}

export const careEventRepository = new CareEventRepository();
