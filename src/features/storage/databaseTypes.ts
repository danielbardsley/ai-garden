export type GardenSQLiteDatabase = {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: unknown[] | unknown): Promise<unknown>;
  getFirstAsync<T>(source: string, params?: unknown[] | unknown): Promise<T | null>;
  getAllAsync<T>(source: string, params?: unknown[] | unknown): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};
