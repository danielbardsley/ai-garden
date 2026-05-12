import { apiBaseUrl } from '../../services/platform';
import { GardenSetup } from '../garden-setup/models/GardenSetup';
import { PhotoRecord, PlantRecord } from '../garden-records/models/GardenRecordTypes';
import { gardenWeekLabel } from '../weather/viewModels/gardenWeekLabel';

const STORAGE_KEY = 'garden-roof-deck:home-title-cache';
const MAX_TITLE_LENGTH = 70;

export type HomeTitleContext = {
  gardenName: string;
  location?: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  gardenWeek: string;
  plantCount: number;
  attentionCount: number;
  attentionPlants: Array<{ name: string; nextAction?: string | null; status?: string | null }>;
  recentPhotoCount: number;
  latestPhotoDate?: string | null;
  isNewGarden: boolean;
};

export type HomeTitleCache = {
  title: string;
  generatedAt: string;
  signature: string;
};

export function buildHomeTitleContext({ setup, plants, attentionPlants, photos, now = new Date() }: { setup?: GardenSetup | null; plants: PlantRecord[]; attentionPlants: PlantRecord[]; photos: PhotoRecord[]; now?: Date }): HomeTitleContext {
  const latestPhotoDate = photos.map((photo) => photo.capturedOn).filter(Boolean).sort().reverse()[0] ?? null;
  const recentPhotoCount = photos.filter((photo) => photo.capturedOn && daysBetween(photo.capturedOn, now) <= 7).length;
  return {
    gardenName: setup?.name?.trim() || 'your garden',
    location: setup?.locationLabel ?? null,
    timeOfDay: timeOfDayBucket(now),
    gardenWeek: gardenWeekLabel(setup?.createdAt),
    plantCount: plants.length,
    attentionCount: attentionPlants.length,
    attentionPlants: attentionPlants.slice(0, 3).map((plant) => ({ name: plant.commonName || plant.displayName, nextAction: plant.nextActionLabel, status: plant.statusLabel })),
    recentPhotoCount,
    latestPhotoDate,
    isNewGarden: setup?.createdAt ? daysSinceDate(setup.createdAt.slice(0, 10), now) <= 7 : false,
  };
}

export function homeTitleSignature(context: HomeTitleContext): string {
  return JSON.stringify({
    gardenName: context.gardenName,
    location: context.location,
    timeOfDay: context.timeOfDay,
    gardenWeek: context.gardenWeek,
    plantCount: context.plantCount,
    attentionCount: context.attentionCount,
    attentionPlants: context.attentionPlants.map((plant) => [plant.name, plant.nextAction, plant.status]),
    recentPhotoCount: context.recentPhotoCount,
    latestPhotoDate: context.latestPhotoDate,
    isNewGarden: context.isNewGarden,
  });
}

export function fallbackHomeTitle(context: HomeTitleContext): string {
  if (context.attentionCount === 1) {
    const plant = context.attentionPlants[0];
    return sanitizeHomeTitle(`${plant?.name ?? 'One plant'} wants a ${context.timeOfDay === 'evening' ? 'last ' : ''}look.`);
  }
  if (context.attentionCount > 1) return sanitizeHomeTitle(`${context.attentionCount} plants want a quick look.`);
  if (context.isNewGarden) return sanitizeHomeTitle(`${context.gardenName} is ready for its first plant.`);
  if (context.recentPhotoCount > 0) return sanitizeHomeTitle(`${context.gardenName} has new things to remember.`);
  if (context.timeOfDay === 'morning') return sanitizeHomeTitle(`${context.gardenName} is waking up.`);
  if (context.timeOfDay === 'afternoon') return sanitizeHomeTitle(`A good afternoon for ${context.gardenName}.`);
  if (context.timeOfDay === 'evening') return sanitizeHomeTitle(`${context.gardenName} is settling in.`);
  return sanitizeHomeTitle(`${context.gardenName} is quiet tonight.`);
}

export function loadingHomeTitle(context: Pick<HomeTitleContext, 'timeOfDay'>): string {
  if (context.timeOfDay === 'morning') return 'Reading the morning garden…';
  if (context.timeOfDay === 'afternoon') return 'Looking over the afternoon garden…';
  if (context.timeOfDay === 'evening') return 'Finding tonight’s garden note…';
  return 'Listening to the quiet garden…';
}


export type HighlightedTitleSegment = {
  text: string;
  highlighted: boolean;
};

export function highlightedHomeTitleSegments(title: string, gardenName?: string | null): HighlightedTitleSegment[] {
  const name = gardenName?.trim();
  if (!name) return [{ text: title, highlighted: false }];
  const lowerTitle = title.toLowerCase();
  const lowerName = name.toLowerCase();
  const index = lowerTitle.indexOf(lowerName);
  if (index < 0) return [{ text: title, highlighted: false }];
  return [
    { text: title.slice(0, index), highlighted: false },
    { text: title.slice(index, index + name.length), highlighted: true },
    { text: title.slice(index + name.length), highlighted: false },
  ].filter((segment) => segment.text.length > 0);
}

export function sanitizeHomeTitle(value?: string | null): string {
  const cleaned = (value ?? '').replace(/[\n\r]+/g, ' ').replace(/^["“”]+|["“”]+$/g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Your garden is waking up.';
  return cleaned.length <= MAX_TITLE_LENGTH ? cleaned : `${cleaned.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`;
}

export function readHomeTitleCache(signature: string, now = new Date()): HomeTitleCache | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as HomeTitleCache | null;
    if (!parsed?.title || parsed.signature !== signature) return null;
    if (!sameLocalDay(new Date(parsed.generatedAt), now)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeHomeTitleCache(title: string, signature: string, now = new Date()): HomeTitleCache | null {
  if (typeof localStorage === 'undefined') return null;
  const cache = { title: sanitizeHomeTitle(title), signature, generatedAt: now.toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    return cache;
  } catch {
    return null;
  }
}

export async function requestAiHomeTitle(context: HomeTitleContext, timeoutMs = 3500): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${apiBaseUrl}/agent/home-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: `home-title-${Date.now()}`, occurredAt: new Date().toISOString(), context }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const payload = await response.json() as { output?: { title?: string | null } | null };
    return payload.output?.title ? sanitizeHomeTitle(payload.output.title) : null;
  } catch {
    return null;
  }
}

function timeOfDayBucket(now: Date): HomeTitleContext['timeOfDay'] {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function daysBetween(dateString: string, now: Date): number {
  return Math.abs(daysSinceDate(dateString, now));
}

function daysSinceDate(dateString: string, now: Date): number {
  const then = new Date(`${dateString}T12:00:00`);
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  return Math.round((today.getTime() - then.getTime()) / 86400000);
}

function sameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}
