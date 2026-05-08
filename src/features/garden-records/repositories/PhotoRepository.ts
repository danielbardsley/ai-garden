import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { PhotoRecord, PhotoTagRecord } from '../models/GardenRecordTypes';
import { mapPhoto } from './rowMappers';
import { webPhotos } from './webFallback';

export class PhotoRepository {
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
