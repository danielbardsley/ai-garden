import { Platform } from 'react-native';

import { apiBaseUrl } from '../../services/platform';
import { requestFailedDiagnostics } from './GardenAgentDiagnostics';
import { CareProfileDraftRequest, CareProfileDraftResponse, CareRecommendationRequest, CareRecommendationResponse, GardenAgentEventRequest, GardenAgentEventResponse, GardenAgentPhotoIdentificationResponse, PhotoIdentificationRequest, PlantChatRequest, PlantChatResponse } from './types';

export class GardenAgentApiClient {

  async identifyPhoto(event: PhotoIdentificationRequest, photoUri: string, mimeType?: string | null): Promise<GardenAgentPhotoIdentificationResponse | null> {
    if (Platform.OS === 'web') return null;
    try {
      const formData = new FormData();
      formData.append('event', JSON.stringify(event));
      formData.append('photo', {
        uri: photoUri,
        name: `${event.eventId}.jpg`,
        type: mimeType ?? 'image/jpeg',
      } as unknown as Blob);
      const response = await fetch(`${apiBaseUrl}/agent/photo-identifications`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) return { diagnostics: requestFailedDiagnostics() };
      return (await response.json()) as GardenAgentPhotoIdentificationResponse;
    } catch {
      return null;
    }
  }

  async submitPhotoCategorization(event: GardenAgentEventRequest, photoUri: string, mimeType?: string | null): Promise<GardenAgentEventResponse | null> {
    if (Platform.OS === 'web') return null;
    try {
      const formData = new FormData();
      formData.append('event', JSON.stringify(event));
      formData.append('photo', {
        uri: photoUri,
        name: `${event.entityId ?? 'garden-photo'}.jpg`,
        type: mimeType ?? 'image/jpeg',
      } as unknown as Blob);
      const response = await fetch(`${apiBaseUrl}/agent/photo-categorizations`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) return null;
      return (await response.json()) as GardenAgentEventResponse;
    } catch {
      return null;
    }
  }

  async submitEvent(event: GardenAgentEventRequest): Promise<GardenAgentEventResponse | null> {
    if (Platform.OS === 'web') return null;
    try {
      const response = await fetch(`${apiBaseUrl}/agent/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!response.ok) return null;
      return (await response.json()) as GardenAgentEventResponse;
    } catch {
      return null;
    }
  }

  async submitPlantChat(request: PlantChatRequest): Promise<PlantChatResponse | null> {
    if (Platform.OS === 'web') return null;
    try {
      const response = await fetch(`${apiBaseUrl}/agent/plant-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) return { diagnostics: requestFailedDiagnostics() };
      return (await response.json()) as PlantChatResponse;
    } catch {
      return null;
    }
  }


  async submitCareRecommendations(request: CareRecommendationRequest): Promise<CareRecommendationResponse | null> {
    if (Platform.OS === 'web') return null;
    try {
      const response = await fetch(`${apiBaseUrl}/agent/care-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) return { diagnostics: requestFailedDiagnostics() };
      return (await response.json()) as CareRecommendationResponse;
    } catch {
      return null;
    }
  }


  async submitCareProfileDraft(request: CareProfileDraftRequest): Promise<CareProfileDraftResponse | null> {
    if (Platform.OS === 'web') return null;
    try {
      const response = await fetch(`${apiBaseUrl}/agent/care-profile-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) return { diagnostics: requestFailedDiagnostics() };
      return (await response.json()) as CareProfileDraftResponse;
    } catch {
      return null;
    }
  }

}

export const gardenAgentApiClient = new GardenAgentApiClient();
