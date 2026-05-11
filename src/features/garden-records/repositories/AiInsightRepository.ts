import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { AiInsightRecord } from '../models/GardenRecordTypes';
import { mapAiInsight } from './rowMappers';

export type CreateAiInsightInput = {
  id: string;
  plantId?: string | null;
  photoId?: string | null;
  observationId?: string | null;
  scope: AiInsightRecord['scope'];
  kind: AiInsightRecord['kind'];
  title?: string | null;
  body: string;
  confidence?: number | null;
  sourceRunId?: string | null;
};

export class AiInsightRepository {
  async createInsight(input: CreateAiInsightInput): Promise<AiInsightRecord | null> {
    if (Platform.OS === 'web') return null;
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR IGNORE INTO ai_insights (
        id, plant_id, photo_id, observation_id, scope, kind, title, body, status,
        confidence, source_run_id, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.plantId ?? null,
        input.photoId ?? null,
        input.observationId ?? null,
        input.scope,
        input.kind,
        input.title ?? null,
        input.body,
        'active',
        input.confidence ?? null,
        input.sourceRunId ?? null,
        now,
        now,
        null,
      ]
    );
    if (!input.sourceRunId) return this.getInsightById(input.id);
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM ai_insights WHERE source_run_id = ? AND photo_id = ? AND kind = ? AND deleted_at IS NULL LIMIT 1;`,
      [input.sourceRunId, input.photoId ?? null, input.kind]
    );
    return row ? mapAiInsight(row) : null;
  }

  async getInsightById(id: string): Promise<AiInsightRecord | null> {
    if (Platform.OS === 'web') return null;
    const db = await getGardenDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM ai_insights WHERE id = ? AND deleted_at IS NULL;', [id]);
    return row ? mapAiInsight(row) : null;
  }

  async listInsightsForPlant(plantId: string): Promise<AiInsightRecord[]> {
    if (Platform.OS === 'web') return [];
    const db = await getGardenDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM ai_insights WHERE plant_id = ? AND deleted_at IS NULL ORDER BY created_at DESC;`,
      [plantId]
    );
    return rows.map(mapAiInsight);
  }

  async listInsightsForPhoto(photoId: string): Promise<AiInsightRecord[]> {
    if (Platform.OS === 'web') return [];
    const db = await getGardenDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM ai_insights WHERE photo_id = ? AND deleted_at IS NULL ORDER BY created_at DESC;`,
      [photoId]
    );
    return rows.map(mapAiInsight);
  }
}

export const aiInsightRepository = new AiInsightRepository();
