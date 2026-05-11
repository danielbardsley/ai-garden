import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';

export type PhotoPlantMatchSource = 'ai_confirmed' | 'ai_corrected' | 'manual_fallback' | 'launched_from_confirmed';

export type CreatePhotoPlantMatchInput = {
  id: string;
  photoId: string;
  observationId?: string | null;
  confirmedPlantId: string;
  suggestedPlantId?: string | null;
  sourceRunId?: string | null;
  matchSource: PhotoPlantMatchSource;
  confidence?: number | null;
  rationale?: string | null;
};

export class PhotoPlantMatchRepository {
  async createMatch(input: CreatePhotoPlantMatchInput): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO photo_plant_matches (
        id, photo_id, observation_id, confirmed_plant_id, suggested_plant_id,
        source_run_id, match_source, confidence, rationale, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.photoId,
        input.observationId ?? null,
        input.confirmedPlantId,
        input.suggestedPlantId ?? null,
        input.sourceRunId ?? null,
        input.matchSource,
        input.confidence ?? null,
        input.rationale ?? null,
        now,
        now,
        null,
      ]
    );
  }
}

export const photoPlantMatchRepository = new PhotoPlantMatchRepository();
