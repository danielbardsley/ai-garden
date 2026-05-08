import type { GardenSQLiteDatabase } from './databaseTypes';

export async function openGardenSqliteDatabase(databaseName: string): Promise<GardenSQLiteDatabase> {
  // Keep native SQLite import isolated from web export bundles.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sqlite = require('expo-sqlite') as typeof import('expo-sqlite');
  return (await sqlite.openDatabaseAsync(databaseName)) as unknown as GardenSQLiteDatabase;
}
