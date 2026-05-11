import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { PhotoRecord, PhotoTagRecord } from '../models/GardenRecordTypes';
import { mapPhoto } from './rowMappers';

export type CreateCapturedPhotoInput = {
  id: string;
  observationId: string;
  plantId: string;
  locationId?: string | null;
  localUri: string;
  thumbnailUri?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  takenAt: string;
  capturedOn: string;
  tone?: string | null;
};

import { webPhotos } from './webFallback';

export class PhotoRepository {

  async createCapturedPhoto(input: CreateCapturedPhotoInput): Promise<PhotoRecord> {
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO photos (
        id, observation_id, plant_id, location_id, local_uri, thumbnail_uri, mime_type,
        width, height, taken_at, captured_on, source, is_cover_candidate, tone,
        created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.observationId,
        input.plantId,
        input.locationId ?? null,
        input.localUri,
        input.thumbnailUri ?? null,
        input.mimeType ?? 'image/jpeg',
        input.width ?? null,
        input.height ?? null,
        input.takenAt,
        input.capturedOn,
        'camera',
        0,
        input.tone ?? null,
        now,
        now,
        null,
      ]
    );
    const row = await db.getFirstAsync<any>(
      `SELECT ph.*, p.glyph as plant_glyph, o.note as note
       FROM photos ph
       LEFT JOIN plants p ON p.id = ph.plant_id
       LEFT JOIN observations o ON o.id = ph.observation_id
       WHERE ph.id = ?;`,
      [input.id]
    );
    if (!row) throw new Error('Failed to create photo.');
    return mapPhoto(row);
  }

  async createSystemTags(photoId: string, tags: string[]): Promise<void> {
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    for (const tag of tags) {
      await db.runAsync(
        `INSERT INTO photo_tags (id, photo_id, tag, source, confidence, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [`tag-${photoId}-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, photoId, tag, 'system', null, now, now, null]
      );
    }
  }

  async createAiTags(photoId: string, tags: { label: string; confidence?: number | null }[]): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getGardenDatabase();
    const now = new Date().toISOString();
    for (const tag of tags) {
      const normalized = tag.label.trim().toLowerCase();
      if (!normalized) continue;
      await db.runAsync(
        `INSERT OR IGNORE INTO photo_tags (id, photo_id, tag, source, confidence, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [`ai-tag-${photoId}-${normalized.replace(/[^a-z0-9]+/g, '-')}`, photoId, normalized, 'ai', tag.confidence ?? null, now, now, null]
      );
    }
  }

  async listGalleryPhotos(filter?: { plantId?: string }): Promise<PhotoRecord[]> {
    if (Platform.OS === 'web') return webPhotos(filter);
    const db = await getGardenDatabase();
    const params: string[] = [];
    let filterSql = 'ph.deleted_at IS NULL';
    if (filter?.plantId) {
      filterSql += ' AND ph.plant_id = ?';
      params.push(filter.plantId);
    }
    const rows = await db.getAllAsync<any>(
      `SELECT ph.*, p.glyph as plant_glyph, o.note as note
       FROM photos ph
       LEFT JOIN plants p ON p.id = ph.plant_id
       LEFT JOIN observations o ON o.id = ph.observation_id
       WHERE ${filterSql}
       ORDER BY ph.captured_on DESC, ph.created_at DESC;`,
      params
    );
    return rows.map(mapPhoto);
  }

  async listTagsForPhoto(photoId: string): Promise<PhotoTagRecord[]> {
    const db = await getGardenDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT id, photo_id, tag, source, confidence FROM photo_tags WHERE photo_id = ? AND deleted_at IS NULL ORDER BY tag;`,
      [photoId]
    );
    return rows.map((row) => ({
      id: row.id,
      photoId: row.photo_id,
      tag: row.tag,
      source: row.source,
      confidence: row.confidence,
    }));
  }
}

export const photoRepository = new PhotoRepository();
