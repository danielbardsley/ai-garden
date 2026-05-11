export function gardenWeekLabel(gardenCreatedAt?: string | null, date = new Date()): string {
  if (!gardenCreatedAt) return currentSeasonWeekLabel(date);
  const created = new Date(gardenCreatedAt);
  if (Number.isNaN(created.getTime())) return currentSeasonWeekLabel(date);
  const elapsedMs = Math.max(0, date.getTime() - created.getTime());
  return `week ${Math.floor(elapsedMs / 604800000) + 1}`;
}

export function currentSeasonWeekLabel(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  return `week ${Math.ceil(dayOfYear / 7)}`;
}
