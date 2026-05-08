import { Platform } from 'react-native';

import { seedGardenDemoData } from '../garden-records/seed/seedGardenDemoData';
import { GardenSQLiteDatabase } from './databaseTypes';
import { openGardenSqliteDatabase } from './nativeSqlite';

const DATABASE_NAME = 'garden_roof_deck.db';
const SCHEMA_VERSION = 1;

let databasePromise: Promise<GardenSQLiteDatabase> | null = null;

export async function getGardenDatabase() {
  if (Platform.OS === 'web') {
    throw new Error('SQLite storage is device-only in this phase; web uses deterministic fixture fallback.');
  }
  if (!databasePromise) {
    databasePromise = initializeDatabase();
  }
  return databasePromise;
}

async function initializeDatabase() {
  const db = await openGardenSqliteDatabase(DATABASE_NAME);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  await seedGardenDemoData(db);
  return db;
}

async function runMigrations(db: GardenSQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_migrations WHERE version = ?;',
    SCHEMA_VERSION
  );

  if (row) return;

  await db.withTransactionAsync(async () => {
    await db.execAsync(V1_SCHEMA_SQL);
    await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);', [
      SCHEMA_VERSION,
      new Date().toISOString(),
    ]);
  });
}

const commonMutableColumns = `
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
`;

const V1_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT,
    description TEXT,
    sun_exposure TEXT,
    sort_order INTEGER,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS seasons (
    id TEXT PRIMARY KEY,
    year INTEGER NOT NULL,
    name TEXT,
    notes TEXT,
    started_on TEXT,
    ended_on TEXT,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS plants (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    common_name TEXT,
    scientific_name TEXT,
    variety_name TEXT,
    description TEXT,
    status_kind TEXT NOT NULL,
    status_label TEXT,
    next_action_label TEXT,
    location_id TEXT REFERENCES locations(id),
    planted_date TEXT,
    started_year INTEGER,
    archived_at TEXT,
    cover_photo_id TEXT,
    glyph TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    sort_order INTEGER,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS observations (
    id TEXT PRIMARY KEY,
    plant_id TEXT REFERENCES plants(id),
    season_id TEXT REFERENCES seasons(id),
    location_id TEXT REFERENCES locations(id),
    observed_on TEXT NOT NULL,
    observed_at TEXT,
    title TEXT,
    note TEXT,
    kind TEXT NOT NULL,
    mood TEXT,
    height_value REAL,
    height_unit TEXT,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    observation_id TEXT REFERENCES observations(id),
    plant_id TEXT REFERENCES plants(id),
    location_id TEXT REFERENCES locations(id),
    local_uri TEXT NOT NULL,
    thumbnail_uri TEXT,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    taken_at TEXT,
    captured_on TEXT,
    source TEXT NOT NULL,
    is_cover_candidate INTEGER NOT NULL DEFAULT 0,
    tone TEXT,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS photo_tags (
    id TEXT PRIMARY KEY,
    photo_id TEXT NOT NULL REFERENCES photos(id),
    tag TEXT NOT NULL,
    source TEXT NOT NULL,
    confidence REAL,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS ai_plant_identifications (
    id TEXT PRIMARY KEY,
    photo_id TEXT NOT NULL REFERENCES photos(id),
    observation_id TEXT REFERENCES observations(id),
    suggested_common_name TEXT,
    suggested_scientific_name TEXT,
    suggested_variety_name TEXT,
    confidence REAL,
    raw_summary TEXT,
    accepted_plant_id TEXT REFERENCES plants(id),
    accepted_at TEXT,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS care_events (
    id TEXT PRIMARY KEY,
    plant_id TEXT NOT NULL REFERENCES plants(id),
    observation_id TEXT REFERENCES observations(id),
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    note TEXT,
    source TEXT NOT NULL,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS care_recommendations (
    id TEXT PRIMARY KEY,
    plant_id TEXT REFERENCES plants(id),
    observation_id TEXT REFERENCES observations(id),
    recommendation_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    due_on TEXT,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    plant_id TEXT REFERENCES plants(id),
    title TEXT,
    scope TEXT NOT NULL,
    ${commonMutableColumns}
  );

  CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES ai_conversations(id),
    role TEXT NOT NULL,
    body TEXT NOT NULL,
    photo_id TEXT REFERENCES photos(id),
    ${commonMutableColumns}
  );

  CREATE INDEX IF NOT EXISTS idx_plants_status_kind ON plants(status_kind);
  CREATE INDEX IF NOT EXISTS idx_plants_location_id ON plants(location_id);
  CREATE INDEX IF NOT EXISTS idx_plants_deleted_at ON plants(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_observations_plant_date ON observations(plant_id, observed_on DESC);
  CREATE INDEX IF NOT EXISTS idx_observations_location_date ON observations(location_id, observed_on DESC);
  CREATE INDEX IF NOT EXISTS idx_observations_kind_date ON observations(kind, observed_on DESC);
  CREATE INDEX IF NOT EXISTS idx_photos_plant_date ON photos(plant_id, captured_on DESC);
  CREATE INDEX IF NOT EXISTS idx_photos_location_date ON photos(location_id, captured_on DESC);
  CREATE INDEX IF NOT EXISTS idx_photos_observation ON photos(observation_id);
  CREATE INDEX IF NOT EXISTS idx_photo_tags_photo ON photo_tags(photo_id);
  CREATE INDEX IF NOT EXISTS idx_photo_tags_tag ON photo_tags(tag);
  CREATE INDEX IF NOT EXISTS idx_care_events_plant_date ON care_events(plant_id, event_date DESC);
  CREATE INDEX IF NOT EXISTS idx_care_recommendations_status_due ON care_recommendations(status, due_on);
  CREATE INDEX IF NOT EXISTS idx_ai_conversations_plant_updated ON ai_conversations(plant_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at);
`;
