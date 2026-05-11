import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { PlantDetailRecord, PlantRecord } from '../models/GardenRecordTypes';
import { mapAiInsight, mapCareEvent, mapCareProfile, mapCareRecommendation, mapConversation, mapConversationMessage, mapObservation, mapPhoto, mapPlant } from './rowMappers';
import { webAttentionPlants, webPlantDetail, webPlants } from './webFallback';

export type CreatePlantInput = {
  id: string;
  displayName: string;
  commonName?: string | null;
  scientificName?: string | null;
  varietyName?: string | null;
  description?: string | null;
  locationId?: string | null;
  glyph?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

const PLANT_SELECT = `
  SELECT p.*, l.name as location_name
  FROM plants p
  LEFT JOIN locations l ON l.id = p.location_id
  WHERE p.deleted_at IS NULL
`;

export class PlantRepository {
  async listActivePlants(): Promise<PlantRecord[]> {
    if (Platform.OS === 'web') return webPlants();
    const db = await getGardenDatabase();
    const rows = await db.getAllAsync<any>(
      `${PLANT_SELECT} AND p.archived_at IS NULL ORDER BY COALESCE(p.sort_order, 999), p.display_name;`
    );
    return rows.map(mapPlant);
  }

  async listPlantsNeedingAttention(): Promise<PlantRecord[]> {
    if (Platform.OS === 'web') return webAttentionPlants();
    const db = await getGardenDatabase();
    const rows = await db.getAllAsync<any>(
      `${PLANT_SELECT}
       AND p.archived_at IS NULL
       AND (
         p.status_kind = 'warn'
         OR LOWER(COALESCE(p.next_action_label, '')) LIKE '%today%'
         OR LOWER(COALESCE(p.next_action_label, '')) LIKE '%tomorrow%'
       )
       ORDER BY CASE p.status_kind WHEN 'warn' THEN 0 ELSE 1 END, COALESCE(p.sort_order, 999);`
    );
    return rows.map(mapPlant);
  }

  async getPlantById(id: string): Promise<PlantRecord | null> {
    if (Platform.OS === 'web') return webPlants().find((plant) => plant.id === id) ?? null;
    const db = await getGardenDatabase();
    const row = await db.getFirstAsync<any>(`${PLANT_SELECT} AND p.id = ?;`, [id]);
    return row ? mapPlant(row) : null;
  }


  async createPlant(input: CreatePlantInput): Promise<PlantRecord> {
    if (Platform.OS === 'web') throw new Error('Plant creation is device-only in this phase.');
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    const sortRow = await db.getFirstAsync<{ max_sort: number | null }>('SELECT MAX(sort_order) as max_sort FROM plants WHERE deleted_at IS NULL;');
    await db.runAsync(
      `INSERT INTO plants (
        id, display_name, common_name, scientific_name, variety_name, description,
        status_kind, status_label, next_action_label, location_id, planted_date,
        started_year, archived_at, cover_photo_id, glyph, primary_color, secondary_color,
        sort_order, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.displayName,
        input.commonName ?? input.displayName,
        input.scientificName ?? null,
        input.varietyName ?? null,
        input.description ?? null,
        'idle',
        'New plant',
        'Add care details',
        input.locationId ?? null,
        null,
        new Date().getFullYear(),
        null,
        null,
        input.glyph ?? 'leaf',
        input.primaryColor ?? '#9bbf78',
        input.secondaryColor ?? '#6f8f54',
        (sortRow?.max_sort ?? 999) + 1,
        now,
        now,
        null,
      ]
    );
    await db.runAsync(
      `INSERT INTO ai_conversations (id, plant_id, title, scope, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [`conversation-${input.id}`, input.id, `${input.displayName} care chat`, 'plant', now, now, null]
    );
    const plant = await this.getPlantById(input.id);
    if (!plant) throw new Error('Failed to add plant to inventory.');
    return plant;
  }

  async getPlantDetail(id: string): Promise<PlantDetailRecord | null> {
    if (Platform.OS === 'web') return webPlantDetail(id);
    const db = await getGardenDatabase();
    const plant = await this.getPlantById(id);
    if (!plant) return null;

    const [observationRows, photoRows, careRows, recommendationRows, insightRows, conversationRow, careProfileRow] = await Promise.all([
      db.getAllAsync<any>(
        `SELECT * FROM observations WHERE plant_id = ? AND deleted_at IS NULL ORDER BY observed_on DESC, created_at DESC;`,
        [id]
      ),
      db.getAllAsync<any>(
        `SELECT ph.*, p.glyph as plant_glyph, o.note as note
         FROM photos ph
         LEFT JOIN plants p ON p.id = ph.plant_id
         LEFT JOIN observations o ON o.id = ph.observation_id
         WHERE ph.plant_id = ? AND ph.deleted_at IS NULL
         ORDER BY ph.captured_on DESC, ph.created_at DESC;`,
        [id]
      ),
      db.getAllAsync<any>(
        `SELECT * FROM care_events WHERE plant_id = ? AND deleted_at IS NULL ORDER BY event_date DESC, created_at DESC;`,
        [id]
      ),
      db.getAllAsync<any>(
        `SELECT * FROM care_recommendations WHERE plant_id = ? AND deleted_at IS NULL ORDER BY due_on DESC, created_at DESC;`,
        [id]
      ),
      db.getAllAsync<any>(
        `SELECT * FROM ai_insights WHERE plant_id = ? AND deleted_at IS NULL ORDER BY created_at DESC;`,
        [id]
      ),
      db.getFirstAsync<any>(
        `SELECT * FROM ai_conversations WHERE plant_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1;`,
        [id]
      ),
      db.getFirstAsync<any>(
        `SELECT * FROM care_profiles WHERE plant_id = ? AND deleted_at IS NULL LIMIT 1;`,
        [id]
      ),
    ]);

    const conversation = conversationRow ? mapConversation(conversationRow) : { id: `conversation-${id}`, plantId: id, title: `${plant.displayName} care chat`, scope: 'plant' as const };
    const messageRows = await db.getAllAsync<any>(
      `SELECT * FROM ai_messages WHERE conversation_id = ? AND deleted_at IS NULL ORDER BY created_at ASC;`,
      [conversation.id]
    );

    return {
      plant,
      observations: observationRows.map(mapObservation),
      photos: photoRows.map(mapPhoto),
      careEvents: careRows.map(mapCareEvent),
      careRecommendations: recommendationRows.map(mapCareRecommendation),
      careProfile: careProfileRow ? mapCareProfile(careProfileRow) : null,
      aiInsights: insightRows.map(mapAiInsight),
      conversation,
      messages: messageRows.map(mapConversationMessage),
    };
  }
}

export const plantRepository = new PlantRepository();
