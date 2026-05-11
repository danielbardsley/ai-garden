import { cameraCaptureService } from '../CameraCaptureService';
import { plantRepository } from '../../repositories/PlantRepository';
import { observationRepository } from '../../repositories/ObservationRepository';
import { photoRepository } from '../../repositories/PhotoRepository';
import { photoPlantMatchRepository } from '../../repositories/PhotoPlantMatchRepository';
import { aiInsightRepository } from '../../repositories/AiInsightRepository';

jest.mock('../../repositories/PlantRepository', () => ({
  plantRepository: { getPlantById: jest.fn(), createPlant: jest.fn() },
}));
jest.mock('../../repositories/ObservationRepository', () => ({
  observationRepository: { createPhotoObservation: jest.fn() },
}));
jest.mock('../../repositories/PhotoRepository', () => ({
  photoRepository: { createCapturedPhoto: jest.fn(), createSystemTags: jest.fn(), createAiTags: jest.fn() },
}));
jest.mock('../../repositories/PhotoPlantMatchRepository', () => ({
  photoPlantMatchRepository: { createMatch: jest.fn() },
}));
jest.mock('../../repositories/AiInsightRepository', () => ({
  aiInsightRepository: { createInsight: jest.fn() },
}));

const plant = {
  id: 'plant-1',
  displayName: 'Snake plant',
  commonName: 'Snake plant',
  statusKind: 'idle' as const,
  primaryColor: '#123',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-08T12:00:00.000Z');
  jest.spyOn(Math, 'random').mockReturnValue(0.123456);
  (plantRepository.getPlantById as jest.Mock).mockResolvedValue(plant);
  (plantRepository.createPlant as jest.Mock).mockResolvedValue(plant);
  (observationRepository.createPhotoObservation as jest.Mock).mockImplementation(async (input) => ({ id: input.id, plantId: input.plantId, observedOn: input.observedOn, kind: 'photo', note: input.note }));
  (photoRepository.createCapturedPhoto as jest.Mock).mockImplementation(async (input) => ({ id: input.id, plantId: input.plantId, observationId: input.observationId, localUri: input.localUri, source: 'camera', isCoverCandidate: false }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('saves a clean-slate photo without seeded season dependency', async () => {
  await cameraCaptureService.saveCapturedPhoto({ plantId: 'plant-1', localUri: 'file://tmp/photo.jpg', mimeType: 'image/jpeg' });

  expect(observationRepository.createPhotoObservation).toHaveBeenCalledWith(expect.objectContaining({
    plantId: 'plant-1',
    seasonId: null,
    note: 'Snake plant photo captured from camera.',
  }));
  expect(photoRepository.createSystemTags).toHaveBeenCalledWith(expect.any(String), ['camera', 'snake', 'garden journal']);
});

test('add-to-inventory uses visualCommonName and persists AI output', async () => {
  const aiAnalysis = {
    runId: 'run-1',
    output: {
      visualCommonName: 'Peace lily',
      openIdentification: 'The plant appears most like a peace lily or similar indoor aroid.',
      summary: 'Likely a peace lily.',
      tags: [{ label: 'peace lily', confidence: 0.9 }],
      insight: { title: 'New plant', body: 'Added from camera.', kind: 'summary' as const, confidence: 0.8 },
      confidence: 0.8,
      plantMatches: [],
    },
  };

  const result = await cameraCaptureService.saveCapturedPhoto({ addNewPlant: true, localUri: 'file://tmp/photo.jpg', aiAnalysis });

  expect(plantRepository.createPlant).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'Peace lily', commonName: 'Peace lily' }));
  expect(result.photo.plantId).toBe('plant-1');
  expect(photoRepository.createAiTags).toHaveBeenCalledWith(expect.any(String), [{ label: 'peace lily', confidence: 0.9 }]);
  expect(aiInsightRepository.createInsight).toHaveBeenCalledWith(expect.objectContaining({ sourceRunId: 'run-1', body: 'Added from camera.' }));
  expect(photoPlantMatchRepository.createMatch).toHaveBeenCalledWith(expect.objectContaining({ matchSource: 'ai_confirmed' }));
});

test('add-to-inventory falls back to cleaned sentence-like identification', async () => {
  await cameraCaptureService.saveCapturedPhoto({
    addNewPlant: true,
    localUri: 'file://tmp/photo.jpg',
    aiAnalysis: {
      runId: 'run-2',
      output: {
        openIdentification: 'The plant appears most like a snake plant, with upright leaves.',
        summary: 'A long summary.',
        tags: [],
        confidence: 0.5,
        plantMatches: [],
      },
    },
  });

  expect(plantRepository.createPlant).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'Snake plant' }));
});
