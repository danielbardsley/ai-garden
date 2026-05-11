import { GardenAgentPhotoIdentificationOutput } from '../garden-agent/types';

const NON_PLANT_PATTERNS = [
  /\bno\s+(?:plant|leaf|foliage|garden)\s+(?:is\s+)?visible\b/i,
  /\bno\s+visible\s+(?:plant|leaf|foliage|garden)\b/i,
  /\bnot\s+a\s+plant\b/i,
  /\bno\s+plant\s+detected\b/i,
  /\bcannot\s+identify\s+(?:a\s+)?plant\b/i,
];

export function isNonPlantIdentification(output?: GardenAgentPhotoIdentificationOutput | null) {
  if (!output) return false;
  const text = [output.visualCommonName, output.openIdentification, output.summary, output.category?.label]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' · ');
  if (!text) return false;
  return NON_PLANT_PATTERNS.some((pattern) => pattern.test(text));
}

export function canAddPhotoIdentificationToInventory(output?: GardenAgentPhotoIdentificationOutput | null) {
  if (!output || isNonPlantIdentification(output)) return false;
  return Boolean(output.visualCommonName?.trim() || output.openIdentification?.trim());
}
