import type { GardenSQLiteDatabase } from './databaseTypes';

export async function openGardenSqliteDatabase(_databaseName: string): Promise<GardenSQLiteDatabase> {
  throw new Error('SQLite storage is device-only in this phase; web uses deterministic fixture fallback.');
}
