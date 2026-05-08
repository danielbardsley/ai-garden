export type PlantStatusKind = 'good' | 'warn' | 'idle';

export type PlantPhoto = {
  id: string;
  d: string;
  tone: string;
  note: string;
  plantId?: string;
  plantGlyph?: string;
};

export type Plant = {
  id: string;
  name: string;
  common: string;
  variety: string;
  location: string;
  plantedAt: string;
  yearStarted: number;
  glyph: string;
  swatch: string[];
  leafTone: string;
  status: { label: string; kind: PlantStatusKind; next: string };
  summary: string;
  care: string[];
  photos: PlantPhoto[];
};

export const plants: Plant[] = [
  {
    id: 'sungold', name: 'Sungold', common: 'Cherry tomato', variety: 'Solanum lycopersicum', location: 'South planter', plantedAt: '2024-04-12', yearStarted: 2024, glyph: 'St', swatch: ['#e89846', '#c25a2b'], leafTone: '#a4b074', status: { label: 'Fruiting', kind: 'good', next: 'Water tomorrow' }, summary: 'Year 3 of these. Trellised against the south rail. First flush of fruit usually mid-July.', care: ['Water deeply and consistently while fruit is setting.', 'Pinch suckers below the first fruiting truss.', 'Feed lightly every week once flowers appear.'], photos: [
      { id: 'sungold-2026-05-04', d: '2026-05-04', tone: '#d6c993', note: 'First trusses forming' },
      { id: 'sungold-2026-04-22', d: '2026-04-22', tone: '#bdc78a', note: 'Pinched suckers' },
      { id: 'sungold-2026-04-08', d: '2026-04-08', tone: '#a8b884', note: 'Hardened off, transplanted' },
      { id: 'sungold-2025-08-24', d: '2025-08-24', tone: '#d97a4a', note: '~80 fruit harvested' },
    ],
  },
  {
    id: 'basil', name: 'Genovese', common: 'Sweet basil', variety: 'Ocimum basilicum', location: 'Kitchen rail box', plantedAt: '2026-03-30', yearStarted: 2024, glyph: 'Bs', swatch: ['#7da259', '#3e5c3a'], leafTone: '#7da259', status: { label: 'Bushy', kind: 'good', next: 'Pinch tops' }, summary: 'Five plants in the kitchen rail box. Pinching tops keeps it from bolting through August.', care: ['Pinch above a leaf pair to encourage branching.', 'Harvest in the morning for best aroma.', 'Keep evenly moist, not soaked.'], photos: [
      { id: 'basil-2026-05-02', d: '2026-05-02', tone: '#7da259', note: '6 leaves per stem' },
      { id: 'basil-2026-04-19', d: '2026-04-19', tone: '#9bb076', note: 'True leaves' },
      { id: 'basil-2025-09-12', d: '2025-09-12', tone: '#5d7a4e', note: 'Final harvest, made pesto' },
    ],
  },
  {
    id: 'mint', name: 'Spearmint', common: 'Spearmint', variety: 'Mentha spicata', location: 'Solo terracotta', plantedAt: '2024-05-01', yearStarted: 2024, glyph: 'Mn', swatch: ['#5d8a52', '#2c4030'], leafTone: '#5d8a52', status: { label: 'Vigorous', kind: 'good', next: 'Trim back' }, summary: 'In its own pot for obvious reasons. Survives winter on the deck without coverage.', care: ['Trim aggressively to keep it dense.', 'Keep it contained in its own pot.', 'Refresh topsoil midseason.'], photos: [
      { id: 'mint-2026-05-05', d: '2026-05-05', tone: '#5d8a52', note: 'Coming back strong' },
      { id: 'mint-2026-04-15', d: '2026-04-15', tone: '#7da259', note: 'New shoots' },
      { id: 'mint-2025-10-22', d: '2025-10-22', tone: '#3e5c3a', note: 'Cut back for winter' },
    ],
  },
  {
    id: 'lavender', name: 'Hidcote', common: 'English lavender', variety: 'Lavandula angustifolia', location: 'West corner', plantedAt: '2024-04-20', yearStarted: 2024, glyph: 'Lv', swatch: ['#8d7eb0', '#4d4870'], leafTone: '#a8b88a', status: { label: 'Budding', kind: 'good', next: 'Hold off water' }, summary: 'Loves the heat off the south wall. Buds usually open by Memorial Day.', care: ['Let soil dry between waterings.', 'Avoid heavy fertilizer.', 'Trim after bloom, not into old wood.'], photos: [
      { id: 'lavender-2026-05-03', d: '2026-05-03', tone: '#a89eb0', note: 'Spikes forming' },
      { id: 'lavender-2025-07-04', d: '2025-07-04', tone: '#8d7eb0', note: 'Full bloom' },
    ],
  },
  {
    id: 'lemon', name: 'Meyer', common: 'Meyer lemon', variety: 'Citrus × meyeri', location: 'Big glazed pot', plantedAt: '2023-05-10', yearStarted: 2023, glyph: 'Ml', swatch: ['#e6c14a', '#7a9558'], leafTone: '#5d7a4e', status: { label: '4 fruit', kind: 'good', next: 'Feed weekly' }, summary: 'Comes inside Nov–Apr. Year 4. Currently carrying four fruit, hoping for six.', care: ['Feed weekly in active growth.', 'Rotate the pot for even light.', 'Watch for spider mites indoors.'], photos: [
      { id: 'lemon-2026-04-30', d: '2026-04-30', tone: '#a4b074', note: '4 fruit set' },
      { id: 'lemon-2026-04-12', d: '2026-04-12', tone: '#cdb96a', note: 'Blossoms' },
      { id: 'lemon-2025-12-04', d: '2025-12-04', tone: '#e6c14a', note: 'One ripe indoors' },
    ],
  },
  {
    id: 'rosemary', name: 'Tuscan Blue', common: 'Rosemary', variety: 'Salvia rosmarinus', location: 'Long planter, end', plantedAt: '2022-05-04', yearStarted: 2022, glyph: 'Rs', swatch: ['#6b8966', '#2e4732'], leafTone: '#6b8966', status: { label: 'Established', kind: 'good', next: 'No action' }, summary: 'Year 5 — woody and roughly 2ft. Survived three winters, knock on wood.', care: ['Lean dry rather than wet.', 'Prune tips after flowering.', 'Protect roots in deep freezes.'], photos: [
      { id: 'rosemary-2026-05-01', d: '2026-05-01', tone: '#6b8966', note: 'Pre-bloom' },
      { id: 'rosemary-2025-04-18', d: '2025-04-18', tone: '#5d7a4e', note: 'Bloomed lightly' },
    ],
  },
  {
    id: 'strawberry', name: 'Mignonette', common: 'Alpine strawberry', variety: 'Fragaria vesca', location: 'Hanging basket', plantedAt: '2025-04-14', yearStarted: 2025, glyph: 'Sw', swatch: ['#c93f3f', '#7da259'], leafTone: '#7da259', status: { label: 'Flowering', kind: 'good', next: 'Net for birds' }, summary: 'Tiny intense berries. Birds got most of last year — netting going up this week.', care: ['Net before fruit blushes red.', 'Keep basket evenly moist.', 'Remove tired leaves after harvest.'], photos: [
      { id: 'strawberry-2026-04-29', d: '2026-04-29', tone: '#dcd8b0', note: 'White flowers' },
      { id: 'strawberry-2025-07-22', d: '2025-07-22', tone: '#c93f3f', note: 'Tiny harvest, ~12 berries' },
    ],
  },
  {
    id: 'jade', name: 'Crassula', common: 'Jade plant', variety: 'Crassula ovata', location: 'East ledge', plantedAt: '2021-08-30', yearStarted: 2021, glyph: 'Jd', swatch: ['#6b8964', '#3e5c3a'], leafTone: '#7da259', status: { label: 'Watch', kind: 'warn', next: 'Inspect leaf drop' }, summary: 'Comes inside in October. A few lower leaves dropped last week — keeping an eye on it.', care: ['Let soil dry fully before watering.', 'Check for sudden temperature swings.', 'Give bright light without scorching.'], photos: [
      { id: 'jade-2026-05-04', d: '2026-05-04', tone: '#9bb076', note: 'Leaf drop, lower stem' },
      { id: 'jade-2025-09-30', d: '2025-09-30', tone: '#6b8964', note: 'Last day outside' },
    ],
  },
  {
    id: 'thyme', name: 'English thyme', common: 'Thyme', variety: 'Thymus vulgaris', location: 'Long planter, middle', plantedAt: '2024-04-30', yearStarted: 2024, glyph: 'Th', swatch: ['#8a9b6c', '#4f5e3e'], leafTone: '#8a9b6c', status: { label: 'Steady', kind: 'good', next: 'Trim flowers' }, summary: 'Low mat in the long herb planter. Best after a haircut.', care: ['Trim flowers to keep leaves tender.', 'Avoid soggy roots.', 'Harvest lightly but often.'], photos: [
      { id: 'thyme-2026-05-01', d: '2026-05-01', tone: '#8a9b6c', note: 'Flower buds starting' },
      { id: 'thyme-2025-06-01', d: '2025-06-01', tone: '#4f5e3e', note: 'Trimmed hard' },
    ],
  },
  {
    id: 'pepper', name: 'Jimmy Nardello', common: 'Sweet pepper', variety: 'Capsicum annuum', location: 'Rail grow bag', plantedAt: '2026-04-18', yearStarted: 2026, glyph: 'Pe', swatch: ['#b94a36', '#5b7a3f'], leafTone: '#5b7a3f', status: { label: 'Settling', kind: 'idle', next: 'Check tomorrow' }, summary: 'First year trying these on the roof deck. The grow bag warms up quickly.', care: ['Protect from cold nights.', 'Stake before fruit gets heavy.', 'Feed after first flowers.'], photos: [
      { id: 'pepper-2026-04-28', d: '2026-04-28', tone: '#8a9b6c', note: 'Settled into grow bag' },
      { id: 'pepper-2026-04-18', d: '2026-04-18', tone: '#5b7a3f', note: 'Transplanted' },
    ],
  },
];

export function plantById(id: string | string[] | undefined) {
  const key = Array.isArray(id) ? id[0] : id;
  return plants.find((plant) => plant.id === key) ?? plants[0];
}

export function allPhotos() {
  return plants.flatMap((plant) =>
    plant.photos.map((photo) => ({ ...photo, plantId: plant.id, plantGlyph: plant.glyph }))
  ).sort((a, b) => b.d.localeCompare(a.d));
}

export function fmtDate(value: string, options: { short?: boolean; year?: boolean } = {}) {
  const date = new Date(`${value}T12:00:00`);
  if (options.short) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(options.year ? { year: 'numeric' } : {}),
  });
}

export function relDays(value: string) {
  const today = new Date('2026-05-07T12:00:00');
  const then = new Date(`${value}T12:00:00`);
  const days = Math.round((today.getTime() - then.getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 31) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}
