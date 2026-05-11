import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { CareRecommendationRecord } from '../models/GardenRecordTypes';
import { mapCareRecommendation } from './rowMappers';

export type CreateCareRecommendationInput = {
  id: string;
  plantId: string;
  recommendationType: string;
  title: string;
  body?: string | null;
  dueOn?: string | null;
};

export class CareRecommendationRepository {
  async createAiSuggestion(input: CreateCareRecommendationInput): Promise<CareRecommendationRecord> {
    if (Platform.OS === 'web') {
      return {
        id: input.id,
        plantId: input.plantId,
        recommendationType: input.recommendationType,
        title: input.title,
        body: input.body ?? null,
        dueOn: input.dueOn ?? null,
        status: 'suggested',
        source: 'ai',
      };
    }
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO care_recommendations (id, plant_id, observation_id, recommendation_type, title, body, due_on, status, source, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [input.id, input.plantId, null, input.recommendationType, input.title, input.body ?? null, input.dueOn ?? null, 'suggested', 'ai', now, now, null]
    );
    const row = await db.getFirstAsync<any>('SELECT * FROM care_recommendations WHERE id = ?;', [input.id]);
    if (!row) throw new Error('Failed to create care recommendation.');
    return mapCareRecommendation(row);
  }

  async markCompleted(recommendationId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getGardenDatabase();
    await db.runAsync(
      `UPDATE care_recommendations SET status = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL;`,
      ['completed', new Date().toISOString(), recommendationId]
    );
  }


  async archiveRecommendation(recommendationId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE care_recommendations SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL;`,
      [now, now, recommendationId]
    );
  }

}

export const careRecommendationRepository = new CareRecommendationRepository();
