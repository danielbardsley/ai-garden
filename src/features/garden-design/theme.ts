export type GardenTheme = {
  name: string;
  bg: string;
  bgSoft: string;
  surface: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  line: string;
  primary: string;
  primaryDeep: string;
  accent: string;
  leaf1: string;
  leaf2: string;
  leaf3: string;
  leaf4: string;
  paperGrain: string;
};

export const mossTheme: GardenTheme = {
  name: 'Moss',
  bg: '#f4f0e6',
  bgSoft: '#ebe5d4',
  surface: '#fffdf7',
  ink: '#23291f',
  inkSoft: '#5b6452',
  inkMuted: '#9aa394',
  line: 'rgba(35,41,31,0.08)',
  primary: '#3e5c3a',
  primaryDeep: '#28402a',
  accent: '#c8643d',
  leaf1: '#6b8964',
  leaf2: '#a8b88a',
  leaf3: '#d8d6b1',
  leaf4: '#e8a07a',
  paperGrain: 'rgba(35,41,31,0.025)',
};

export const forestTheme: GardenTheme = {
  name: 'Forest',
  bg: '#1f2a23',
  bgSoft: '#283832',
  surface: '#324239',
  ink: '#f0ead8',
  inkSoft: '#bdc4ad',
  inkMuted: '#7e8a76',
  line: 'rgba(240,234,216,0.08)',
  primary: '#9bbf78',
  primaryDeep: '#bbd99a',
  accent: '#e8a87c',
  leaf1: '#5d7a4e',
  leaf2: '#3d5a3a',
  leaf3: '#2c4030',
  leaf4: '#a47b5c',
  paperGrain: 'rgba(240,234,216,0.018)',
};

export const theme = mossTheme;
