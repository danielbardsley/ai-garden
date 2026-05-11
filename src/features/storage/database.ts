import { Platform } from 'react-native';

import { GardenSQLiteDatabase } from './databaseTypes';
import { openGardenSqliteDatabase } from './nativeSqlite';

const DATABASE_NAME = 'garden_roof_deck.db';
const SCHEMA_VERSION = 5;

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
  return db;
}

async function runMigrations(db: GardenSQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const rows = await db.getAllAsync<{ version: number }>('SELECT version FROM schema_migrations;');
  const applied = new Set(rows.map((item) => item.version));

  await db.withTransactionAsync(async () => {
    if (!applied.has(1)) {
      await db.execAsync(V1_SCHEMA_SQL);
      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);', [1, new Date().toISOString()]);
    }
    if (!applied.has(2)) {
      await db.execAsync(V2_SCHEMA_SQL);
      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);', [2, new Date().toISOString()]);
    }

    if (!applied.has(3)) {
      await db.execAsync(V3_SCHEMA_SQL);
      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);', [3, new Date().toISOString()]);
    }
    if (!applied.has(4)) {
      await db.execAsync(V4_SCHEMA_SQL);
      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);', [4, new Date().toISOString()]);
    }
    if (!applied.has(5)) {
      await db.execAsync(V5_SCHEMA_SQL);
      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);', [5, new Date().toISOString()]);
    }
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

const V2_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS ai_insights (
    id TEXT PRIMARY KEY,
    plant_id TEXT REFERENCES plants(id),
    photo_id TEXT REFERENCES photos(id),
    observation_id TEXT REFERENCES observations(id),
    scope TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    confidence REAL,
    source_run_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_insights_source_run ON ai_insights(source_run_id, photo_id, kind);
  CREATE INDEX IF NOT EXISTS idx_ai_insights_plant ON ai_insights(plant_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_ai_insights_photo ON ai_insights(photo_id, created_at DESC);
`;


const V3_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS photo_plant_matches (
    id TEXT PRIMARY KEY,
    photo_id TEXT NOT NULL REFERENCES photos(id),
    observation_id TEXT REFERENCES observations(id),
    confirmed_plant_id TEXT NOT NULL REFERENCES plants(id),
    suggested_plant_id TEXT REFERENCES plants(id),
    source_run_id TEXT,
    match_source TEXT NOT NULL,
    confidence REAL,
    rationale TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_photo_plant_matches_photo ON photo_plant_matches(photo_id);
  CREATE INDEX IF NOT EXISTS idx_photo_plant_matches_confirmed ON photo_plant_matches(confirmed_plant_id, created_at DESC);
`;


const V4_SCHEMA_SQL = `
  ALTER TABLE ai_messages ADD COLUMN plant_id TEXT REFERENCES plants(id);
  ALTER TABLE ai_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'sent';
  ALTER TABLE ai_messages ADD COLUMN source_run_id TEXT;
  ALTER TABLE ai_messages ADD COLUMN metadata_json TEXT;

  CREATE INDEX IF NOT EXISTS idx_ai_messages_plant_created ON ai_messages(plant_id, created_at DESC);
`;


const V5_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS care_profiles (
    id TEXT PRIMARY KEY,
    plant_id TEXT NOT NULL REFERENCES plants(id),
    light_preference TEXT,
    watering_rhythm TEXT,
    soil_moisture_preference TEXT,
    fertilizer_cadence TEXT,
    pruning_notes TEXT,
    harvest_notes TEXT,
    location_notes TEXT,
    general_notes TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_care_profiles_plant_active ON care_profiles(plant_id) WHERE deleted_at IS NULL;
`;
