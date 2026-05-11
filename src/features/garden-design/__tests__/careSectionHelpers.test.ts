import { buildCareActionPresentation, groupCareRecommendations, isCareRelevantInsight, selectNextCareAction, sortCareEvents } from '../careSectionHelpers';
import { AiInsightRecord, CareEventRecord, CareRecommendationRecord, PlantRecord } from '../../garden-records/models/GardenRecordTypes';

const plant: PlantRecord = { id: 'plant-1', displayName: 'Basil', statusKind: 'good', statusLabel: 'Doing well', nextActionLabel: 'Check soil tomorrow' };

test('selectNextCareAction prefers active due recommendations over plant next action', () => {
  const recommendations: CareRecommendationRecord[] = [
    { id: 'later', plantId: 'plant-1', recommendationType: 'water', title: 'Water later', dueOn: '9999-01-01', status: 'suggested', source: 'ai' },
    { id: 'now', plantId: 'plant-1', recommendationType: 'water', title: 'Water now', dueOn: '2000-01-01', status: 'suggested', source: 'ai' },
  ];

  expect(selectNextCareAction(plant, recommendations)).toMatchObject({ title: 'Water now', source: 'ai' });
});

test('selectNextCareAction falls back to plant action then empty state', () => {
  expect(selectNextCareAction(plant, [])).toMatchObject({ title: 'Check soil tomorrow', source: 'system' });
  expect(selectNextCareAction({ ...plant, nextActionLabel: 'No action' }, [])).toMatchObject({ empty: true });
});

test('groupCareRecommendations separates active and inactive statuses', () => {
  const recommendations: CareRecommendationRecord[] = [
    { id: 'done', plantId: 'plant-1', recommendationType: 'water', title: 'Done', status: 'completed', source: 'manual' },
    { id: 'todo', plantId: 'plant-1', recommendationType: 'water', title: 'Todo', status: 'suggested', source: 'ai' },
  ];

  expect(groupCareRecommendations(recommendations).active.map((item) => item.id)).toEqual(['todo']);
  expect(groupCareRecommendations(recommendations).inactive.map((item) => item.id)).toEqual(['done']);
});

test('isCareRelevantInsight finds care, attention, and risk notes', () => {
  const base: AiInsightRecord = { id: 'insight', scope: 'photo', kind: 'summary', body: 'ok', status: 'active' };
  expect(isCareRelevantInsight(base)).toBe(false);
  expect(isCareRelevantInsight({ ...base, kind: 'care_note' })).toBe(true);
  expect(isCareRelevantInsight({ ...base, kind: 'risk' })).toBe(true);
  expect(isCareRelevantInsight({ ...base, scope: 'care' })).toBe(true);
});

test('sortCareEvents returns newest first', () => {
  const events: CareEventRecord[] = [
    { id: 'old', plantId: 'plant-1', eventType: 'water', eventDate: '2026-05-01', source: 'manual' },
    { id: 'new', plantId: 'plant-1', eventType: 'water', eventDate: '2026-05-09', source: 'manual' },
  ];

  expect(sortCareEvents(events).map((item) => item.id)).toEqual(['new', 'old']);
});


test('buildCareActionPresentation promotes next recommendation and removes it from active list', () => {
  const recommendations: CareRecommendationRecord[] = [
    { id: 'top', plantId: 'plant-1', recommendationType: 'water', title: 'Water now', dueOn: '2000-01-01', status: 'suggested', source: 'ai' },
    { id: 'other', plantId: 'plant-1', recommendationType: 'fertilize', title: 'Feed later', dueOn: '9999-01-01', status: 'suggested', source: 'ai' },
    { id: 'done', plantId: 'plant-1', recommendationType: 'prune', title: 'Done', status: 'completed', source: 'manual' },
  ];

  const presentation = buildCareActionPresentation(plant, recommendations);

  expect(presentation.nextAction).toMatchObject({ title: 'Water now', recommendationId: 'top' });
  expect(presentation.groups.active.map((item) => item.id)).toEqual(['other']);
  expect(presentation.groups.inactive.map((item) => item.id)).toEqual(['done']);
});

test('buildCareActionPresentation keeps recommendations when next action is plant fallback', () => {
  const inactive: CareRecommendationRecord[] = [
    { id: 'done', plantId: 'plant-1', recommendationType: 'water', title: 'Done', status: 'completed', source: 'manual' },
  ];

  const presentation = buildCareActionPresentation(plant, inactive);

  expect(presentation.nextAction).toMatchObject({ title: 'Check soil tomorrow', source: 'system' });
  expect(presentation.promotedRecommendationId).toBeNull();
  expect(presentation.groups.inactive.map((item) => item.id)).toEqual(['done']);
});
