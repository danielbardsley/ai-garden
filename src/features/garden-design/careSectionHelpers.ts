import { AiInsightRecord, CareEventRecord, CareRecommendationRecord, PlantRecord } from '../garden-records/models/GardenRecordTypes';

export type NextCareAction = {
  title: string;
  body?: string | null;
  dueOn?: string | null;
  source?: string | null;
  status?: string | null;
  recommendationType?: string | null;
  empty?: boolean;
  recommendationId?: string | null;
};

const inactiveStatuses = new Set(['completed', 'dismissed']);

export function selectNextCareAction(plant: PlantRecord, recommendations: CareRecommendationRecord[]): NextCareAction {
  const activeRecommendations = sortCareRecommendations(recommendations).filter((item) => !inactiveStatuses.has(item.status));
  const urgent = activeRecommendations.find((item) => isDueOrOverdue(item.dueOn));
  const selected = urgent ?? activeRecommendations[0];
  if (selected) {
    return {
      title: selected.title,
      body: selected.body,
      dueOn: selected.dueOn,
      source: selected.source,
      status: selected.status,
      recommendationType: selected.recommendationType,
      recommendationId: selected.id,
    };
  }
  const nextAction = plant.nextActionLabel?.trim();
  if (nextAction && !/^no action$/i.test(nextAction)) {
    return {
      title: nextAction,
      body: plant.statusLabel ?? null,
      source: 'system',
      status: plant.statusKind,
    };
  }
  return { title: 'No care action queued.', body: 'Keep observing this plant and log care as it happens.', empty: true };
}


export function buildCareActionPresentation(plant: PlantRecord, recommendations: CareRecommendationRecord[]) {
  const nextAction = selectNextCareAction(plant, recommendations);
  const promotedRecommendationId = nextAction.recommendationId ?? null;
  const groups = groupCareRecommendations(recommendations);
  return {
    nextAction,
    promotedRecommendationId,
    groups: {
      active: promotedRecommendationId ? groups.active.filter((item) => item.id !== promotedRecommendationId) : groups.active,
      inactive: groups.inactive,
    },
  };
}

export function sortCareRecommendations(recommendations: CareRecommendationRecord[]): CareRecommendationRecord[] {
  return [...recommendations].sort((a, b) => {
    const aInactive = inactiveStatuses.has(a.status) ? 1 : 0;
    const bInactive = inactiveStatuses.has(b.status) ? 1 : 0;
    if (aInactive !== bInactive) return aInactive - bInactive;
    const aDue = a.dueOn ?? '9999-12-31';
    const bDue = b.dueOn ?? '9999-12-31';
    if (aDue !== bDue) return aDue.localeCompare(bDue);
    return a.title.localeCompare(b.title);
  });
}

export function groupCareRecommendations(recommendations: CareRecommendationRecord[]) {
  const sorted = sortCareRecommendations(recommendations);
  return {
    active: sorted.filter((item) => !inactiveStatuses.has(item.status)),
    inactive: sorted.filter((item) => inactiveStatuses.has(item.status)),
  };
}

export function isCareRelevantInsight(insight: AiInsightRecord): boolean {
  return insight.scope === 'care' || insight.kind === 'care_note' || insight.kind === 'attention' || insight.kind === 'risk';
}

export function sortCareEvents(events: CareEventRecord[]): CareEventRecord[] {
  return [...events].sort((a, b) => b.eventDate.localeCompare(a.eventDate));
}

export function formatCareSource(source?: string | null): string {
  if (!source) return 'Source unknown';
  if (source === 'ai' || source === 'ai_suggested') return 'AI suggested';
  if (source === 'system') return 'System';
  if (source === 'manual') return 'Manual';
  return source.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatCareType(type?: string | null): string {
  if (!type) return 'Care';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDueLabel(dueOn?: string | null): string | null {
  if (!dueOn) return null;
  if (isDueOrOverdue(dueOn)) return `Due ${dueOn}`;
  return `Due ${dueOn}`;
}

function isDueOrOverdue(dueOn?: string | null): boolean {
  if (!dueOn) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueOn <= today;
}
