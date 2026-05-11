import { Platform } from 'react-native';

const DEFAULT_BASE_PATH = '/apps/garden-roof-deck/';
const DEFAULT_API_BASE_PATH = '/api/garden-roof-deck/';
const DEFAULT_NATIVE_API_ORIGIN = 'http://100.109.137.10:18100';

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return '/';
  const withLead = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function buildApiBaseUrl({
  platformOS,
  origin,
  path,
}: {
  platformOS: string;
  origin?: string;
  path?: string;
}) {
  const normalizedPath = normalizePath(path ?? DEFAULT_API_BASE_PATH);
  const pathNoTrailing = trimTrailingSlash(normalizedPath);
  const rawOrigin = (origin ?? (platformOS === 'web' ? '' : DEFAULT_NATIVE_API_ORIGIN)).trim();
  const originNoTrailing = trimTrailingSlash(rawOrigin);

  if (platformOS === 'web') return `${originNoTrailing}${pathNoTrailing}`;
  if (!originNoTrailing) return pathNoTrailing;
  if (originNoTrailing.endsWith(pathNoTrailing)) return originNoTrailing;
  return `${originNoTrailing}${pathNoTrailing}`;
}

export const basePath = normalizePath(process.env.EXPO_PUBLIC_BASE_PATH ?? DEFAULT_BASE_PATH);
export const apiBasePath = normalizePath(process.env.EXPO_PUBLIC_API_BASE_PATH ?? DEFAULT_API_BASE_PATH);
export const apiOrigin = process.env.EXPO_PUBLIC_API_ORIGIN ?? (Platform.OS === 'web' ? '' : DEFAULT_NATIVE_API_ORIGIN);
export const apiBaseUrl = buildApiBaseUrl({ platformOS: Platform.OS, origin: apiOrigin, path: apiBasePath });
