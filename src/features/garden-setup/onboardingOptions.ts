import { SunExposure } from './models/GardenSetup';

export const gardenNameSuggestions = ['Back Garden', 'Kitchen Garden', 'Patio Garden', 'The Greenhouse', 'Roof Garden', 'Balcony Garden', 'Windowsill', 'Allotment Plot'];
export const gardenGlyphs = ['Gd', 'Bg', 'Kg', 'Pt', 'Gh', 'Al'];
export const hardinessZones = ['Not sure', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a'];

export const sunExposureOptions: { id: SunExposure; label: string; sub: string; mark: string }[] = [
  { id: 'shade', label: 'Mostly shade', sub: '< 3 hrs sun', mark: '◐' },
  { id: 'partial', label: 'Partial sun', sub: '3–6 hrs', mark: '◑' },
  { id: 'full', label: 'Full sun', sub: '6+ hrs', mark: '◉' },
];

export const growingSpaceOptions = [
  { id: 'in-ground', label: 'In-ground beds', sub: 'Traditional back garden soil', glyph: 'Gr' },
  { id: 'raised-beds', label: 'Raised beds', sub: 'Framed beds and kitchen gardens', glyph: 'Rb' },
  { id: 'containers', label: 'Containers / pots', sub: 'Pots, tubs, and planters', glyph: 'Po' },
  { id: 'patio', label: 'Patio / courtyard', sub: 'Paved spaces and sheltered corners', glyph: 'Pa' },
  { id: 'balcony-roof', label: 'Balcony / roof deck', sub: 'Windy, bright, container-heavy', glyph: 'Bk' },
  { id: 'greenhouse', label: 'Greenhouse / cold frame', sub: 'Protected starts and tender crops', glyph: 'Gh' },
  { id: 'indoor', label: 'Indoor / windowsill', sub: 'Houseplants, herbs, seedlings', glyph: 'In' },
  { id: 'allotment', label: 'Allotment / community plot', sub: 'A growing space away from home', glyph: 'Al' },
];
