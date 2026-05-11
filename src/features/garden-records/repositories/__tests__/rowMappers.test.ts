import { mapAiInsight, mapObservation, mapPhoto, mapPlant } from '../rowMappers';

test('maps plant rows to frontend plant records', () => {
  expect(mapPlant({
    id: 'p1', display_name: 'Crassula', common_name: 'Jade plant', status_kind: 'good', primary_color: '#111'
  })).toMatchObject({ id: 'p1', displayName: 'Crassula', commonName: 'Jade plant', statusKind: 'good', primaryColor: '#111' });
});

test('maps observation/photo/insight rows', () => {
  expect(mapObservation({ id: 'o1', observed_on: '2026-05-08', kind: 'photo' })).toMatchObject({ id: 'o1', observedOn: '2026-05-08', kind: 'photo' });
  expect(mapPhoto({ id: 'ph1', local_uri: 'file://photo.jpg', source: 'camera', is_cover_candidate: 1 })).toMatchObject({ id: 'ph1', localUri: 'file://photo.jpg', isCoverCandidate: true });
  expect(mapAiInsight({ id: 'i1', scope: 'photo', kind: 'summary', body: 'Looks good', status: 'active' })).toMatchObject({ id: 'i1', body: 'Looks good', status: 'active' });
});
