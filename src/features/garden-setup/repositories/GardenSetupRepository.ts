import { Platform } from 'react-native';

import { getGardenDatabase } from '../../storage/database';
import { GardenSetup, SaveGardenSetupInput } from '../models/GardenSetup';

export const GARDEN_SETUP_SETTING_KEY = 'garden.setup';
const WEB_STORAGE_KEY = 'garden-roof-deck:garden-setup';

function createId() {
  return `garden-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseSetup(value: string | null | undefined): GardenSetup | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as GardenSetup;
    return parsed?.name && parsed?.locationLabel ? parsed : null;
  } catch {
    return null;
  }
}

export class GardenSetupRepository {
  async getSetup(): Promise<GardenSetup | null> {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return null;
      return parseSetup(localStorage.getItem(WEB_STORAGE_KEY));
    }

    const db = await getGardenDatabase();
    const row = await db.getFirstAsync<{ value_json: string }>('SELECT value_json FROM app_settings WHERE key = ?;', [GARDEN_SETUP_SETTING_KEY]);
    return parseSetup(row?.value_json);
  }

  async saveSetup(input: SaveGardenSetupInput): Promise<GardenSetup> {
    const existing = await this.getSetup();
    const now = new Date().toISOString();
    const setup: GardenSetup = {
      id: existing?.id ?? createId(),
      name: input.name.trim(),
      glyph: input.glyph ?? null,
      locationLabel: input.locationLabel.trim(),
      hardinessZone: input.hardinessZone?.trim() || null,
      sunExposure: input.sunExposure ?? null,
      growingSpaces: [...input.growingSpaces],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(setup));
      return setup;
    }

    const db = await getGardenDatabase();
    await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);', [
      GARDEN_SETUP_SETTING_KEY,
      JSON.stringify(setup),
      now,
    ]);
    return setup;
  }

  async clearSetup(): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(WEB_STORAGE_KEY);
      return;
    }

    const db = await getGardenDatabase();
    await db.runAsync('DELETE FROM app_settings WHERE key = ?;', [GARDEN_SETUP_SETTING_KEY]);
  }
}

export const gardenSetupRepository = new GardenSetupRepository();
