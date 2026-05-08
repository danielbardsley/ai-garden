import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { PlantDetailRecord, PlantRecord } from '../models/GardenRecordTypes';
import { mapCareEvent, mapCareRecommendation, mapConversation, mapObservation, mapPhoto, mapPlant } from './rowMappers';
import { webAttentionPlants, webPlantDetail, webPlants } from './webFallback';

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

  async getPlantDetail(id: string): Promise<PlantDetailRecord | null> {
    if (Platform.OS === 'web') return webPlantDetail(id);
    const db = await getGardenDatabase();
    const plant = await this.getPlantById(id);
    if (!plant) return null;

    const [observationRows, photoRows, careRows, recommendationRows, conversationRow] = await Promise.all([
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
      db.getFirstAsync<any>(
        `SELECT * FROM ai_conversations WHERE plant_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1;`,
        [id]
      ),
    ]);

    return {
      plant,
      observations: observationRows.map(mapObservation),
      photos: photoRows.map(mapPhoto),
      careEvents: careRows.map(mapCareEvent),
      careRecommendations: recommendationRows.map(mapCareRecommendation),
      conversation: conversationRow ? mapConversation(conversationRow) : { id: `conversation-${id}`, plantId: id, title: `${plant.displayName} care chat`, scope: 'plant' },
    };
  }
}

export const plantRepository = new PlantRepository();
