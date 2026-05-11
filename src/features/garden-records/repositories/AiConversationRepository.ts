import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { AiConversationMessageRecord } from '../models/GardenRecordTypes';
import { mapConversationMessage } from './rowMappers';

export type CreateConversationMessageInput = {
  id: string;
  conversationId: string;
  plantId?: string | null;
  role: AiConversationMessageRecord['role'];
  body: string;
  status?: AiConversationMessageRecord['status'];
  sourceRunId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export class AiConversationRepository {
  async ensurePlantConversation(input: { id: string; plantId: string; title?: string | null }) {
    if (Platform.OS === 'web') return;
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR IGNORE INTO ai_conversations (id, plant_id, title, scope, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [input.id, input.plantId, input.title ?? 'Plant care chat', 'plant', now, now, null]
    );
  }

  async listMessages(conversationId: string): Promise<AiConversationMessageRecord[]> {
    if (Platform.OS === 'web') return [];
    const db = await getGardenDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM ai_messages WHERE conversation_id = ? AND deleted_at IS NULL ORDER BY created_at ASC;`,
      [conversationId]
    );
    return rows.map(mapConversationMessage);
  }

  async createMessage(input: CreateConversationMessageInput): Promise<AiConversationMessageRecord> {
    if (Platform.OS === 'web') {
      return {
        id: input.id,
        conversationId: input.conversationId,
        plantId: input.plantId,
        role: input.role,
        body: input.body,
        status: input.status ?? 'sent',
        sourceRunId: input.sourceRunId,
        metadata: input.metadata ?? null,
        createdAt: new Date().toISOString(),
      };
    }
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO ai_messages (
        id, conversation_id, role, body, photo_id, plant_id, status, source_run_id, metadata_json, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.conversationId,
        input.role,
        input.body,
        null,
        input.plantId ?? null,
        input.status ?? 'sent',
        input.sourceRunId ?? null,
        input.metadata ? JSON.stringify(input.metadata) : null,
        now,
        now,
        null,
      ]
    );
    await db.runAsync('UPDATE ai_conversations SET updated_at = ? WHERE id = ?;', [now, input.conversationId]);
    const row = await db.getFirstAsync<any>('SELECT * FROM ai_messages WHERE id = ?;', [input.id]);
    if (!row) throw new Error('Failed to create AI conversation message.');
    return mapConversationMessage(row);
  }

  async markMessageStatus(id: string, status: AiConversationMessageRecord['status']): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getGardenDatabase();
    await db.runAsync('UPDATE ai_messages SET status = ?, updated_at = ? WHERE id = ?;', [status, new Date().toISOString(), id]);
  }
}

export const aiConversationRepository = new AiConversationRepository();
