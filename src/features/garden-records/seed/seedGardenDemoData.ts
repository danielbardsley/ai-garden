import { plants } from '../../garden-design/data';

const NOW = '2026-05-07T12:00:00.000Z';

function quoteId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

import { GardenSQLiteDatabase } from '../../storage/databaseTypes';

export async function seedGardenDemoData(db: GardenSQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM plants WHERE deleted_at IS NULL;');
  if ((row?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);', [
      'seed.demo.version',
      JSON.stringify({ version: 1, seededAt: NOW }),
      NOW,
    ]);

    await db.runAsync(
      'INSERT INTO seasons (id, year, name, notes, started_on, ended_on, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
      ['season-2026', 2026, '2026 roof deck', 'Demo season seeded from the AI Garden design prototype.', '2026-03-01', null, NOW, NOW, null]
    );

    const locationIds = new Map<string, string>();
    for (const plant of plants) {
      if (!locationIds.has(plant.location)) {
        const id = `location-${quoteId(plant.location)}`;
        locationIds.set(plant.location, id);
        await db.runAsync(
          `INSERT INTO locations (id, name, kind, description, sun_exposure, sort_order, created_at, updated_at, deleted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [id, plant.location, inferLocationKind(plant.location), null, inferSunExposure(plant.location), locationIds.size, NOW, NOW, null]
        );
      }
    }

    for (const [index, plant] of plants.entries()) {
      const locationId = locationIds.get(plant.location) ?? null;
      const coverPhotoId = `${plant.id}-${plant.photos[0]?.d ?? 'cover'}-photo`;
      await db.runAsync(
        `INSERT INTO plants (
          id, display_name, common_name, scientific_name, variety_name, description,
          status_kind, status_label, next_action_label, location_id, planted_date,
          started_year, archived_at, cover_photo_id, glyph, primary_color, secondary_color,
          sort_order, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          plant.id,
          plant.name,
          plant.common,
          plant.variety,
          plant.variety,
          plant.summary,
          plant.status.kind,
          plant.status.label,
          plant.status.next,
          locationId,
          plant.plantedAt,
          plant.yearStarted,
          null,
          coverPhotoId,
          plant.glyph,
          plant.swatch[0],
          plant.swatch[1] ?? plant.swatch[0],
          index,
          NOW,
          NOW,
          null,
        ]
      );

      await db.runAsync(
        `INSERT INTO ai_conversations (id, plant_id, title, scope, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [`conversation-${plant.id}`, plant.id, `${plant.name} care chat`, 'plant', NOW, NOW, null]
      );

      await db.runAsync(
        `INSERT INTO ai_messages (id, conversation_id, role, body, photo_id, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          `message-${plant.id}-seed`,
          `conversation-${plant.id}`,
          'assistant',
          `Hey! I'm tracking your ${plant.common} with you. I can see ${plant.photos.length} photos so far. What's on your mind?`,
          null,
          NOW,
          NOW,
          null,
        ]
      );

      for (const [careIndex, note] of plant.care.entries()) {
        await db.runAsync(
          `INSERT INTO care_events (id, plant_id, observation_id, event_type, event_date, note, source, created_at, updated_at, deleted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [`care-${plant.id}-${careIndex + 1}`, plant.id, null, inferCareType(note), '2026-05-07', note, 'system', NOW, NOW, null]
        );
      }

      if (plant.status.next && plant.status.next !== 'No action') {
        await db.runAsync(
          `INSERT INTO care_recommendations (id, plant_id, observation_id, recommendation_type, title, body, due_on, status, source, created_at, updated_at, deleted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            `recommendation-${plant.id}`,
            plant.id,
            null,
            inferRecommendationType(plant.status.next),
            plant.status.next,
            `${plant.status.next} · ${plant.common}`,
            plant.status.next.toLowerCase().includes('tomorrow') ? '2026-05-08' : '2026-05-07',
            'suggested',
            'system',
            NOW,
            NOW,
            null,
          ]
        );
      }

      for (const photo of plant.photos) {
        const observationId = `${plant.id}-${photo.d}-observation`;
        const photoId = `${plant.id}-${photo.d}-photo`;
        await db.runAsync(
          `INSERT INTO observations (
            id, plant_id, season_id, location_id, observed_on, observed_at, title, note,
            kind, mood, height_value, height_unit, created_at, updated_at, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [observationId, plant.id, 'season-2026', locationId, photo.d, `${photo.d}T12:00:00.000Z`, null, photo.note, 'photo', plant.status.kind === 'warn' ? 'watch' : 'good', null, null, NOW, NOW, null]
        );
        await db.runAsync(
          `INSERT INTO photos (
            id, observation_id, plant_id, location_id, local_uri, thumbnail_uri, mime_type,
            width, height, taken_at, captured_on, source, is_cover_candidate, tone,
            created_at, updated_at, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [photoId, observationId, plant.id, locationId, `placeholder://${photoId}`, null, 'image/placeholder', null, null, `${photo.d}T12:00:00.000Z`, photo.d, 'generated_placeholder', photo.d === plant.photos[0].d ? 1 : 0, photo.tone, NOW, NOW, null]
        );
        const tags = ['leaves', 'healthy color', plant.common.toLowerCase().split(' ')[0], 'morning light'];
        for (const tag of tags) {
          await db.runAsync(
            `INSERT INTO photo_tags (id, photo_id, tag, source, confidence, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [`tag-${photoId}-${quoteId(tag)}`, photoId, tag, 'system', null, NOW, NOW, null]
          );
        }
      }
    }
  });
}

function inferLocationKind(location: string) {
  const text = location.toLowerCase();
  if (text.includes('basket')) return 'hanging_basket';
  if (text.includes('rail')) return 'rail_box';
  if (text.includes('pot') || text.includes('terracotta')) return 'container';
  if (text.includes('planter')) return 'container';
  return 'other';
}

function inferSunExposure(location: string) {
  const text = location.toLowerCase();
  if (text.includes('south') || text.includes('west')) return 'full_sun';
  if (text.includes('east')) return 'part_sun';
  return 'unknown';
}

function inferCareType(note: string) {
  const text = note.toLowerCase();
  if (text.includes('water')) return 'water';
  if (text.includes('feed') || text.includes('fertil')) return 'fertilize';
  if (text.includes('prune') || text.includes('trim') || text.includes('pinch')) return 'prune';
  if (text.includes('harvest')) return 'harvest';
  if (text.includes('check') || text.includes('watch')) return 'inspect';
  return 'other';
}

function inferRecommendationType(text: string) {
  const value = text.toLowerCase();
  if (value.includes('water')) return 'water';
  if (value.includes('feed')) return 'fertilize';
  if (value.includes('trim') || value.includes('pinch') || value.includes('prune')) return 'prune';
  if (value.includes('inspect') || value.includes('check')) return 'inspect';
  return 'other';
}
