import { apiBaseUrl } from '../../services/platform';

export type GardenAgentDiagnosticsFailureKind = 'api_unreachable' | 'agent_unconfigured' | 'request_failed' | 'unknown' | null;

export type GardenAgentDiagnostics = {
  apiReachable: boolean;
  agentConfigured: boolean | null;
  agentProvider?: string | null;
  agentModel?: string | null;
  failureKind: GardenAgentDiagnosticsFailureKind;
  message: string;
};

type HealthPayload = {
  status?: string;
  agentConfigured?: boolean;
  agentProvider?: string | null;
  agentModel?: string | null;
};

export function classifyHealthResponse(payload: HealthPayload): GardenAgentDiagnostics {
  const configured = payload.agentConfigured === true;
  if (!configured) {
    return {
      apiReachable: true,
      agentConfigured: false,
      agentProvider: payload.agentProvider ?? null,
      agentModel: payload.agentModel ?? null,
      failureKind: 'agent_unconfigured',
      message: 'AI provider is not configured on the server.',
    };
  }
  return {
    apiReachable: true,
    agentConfigured: true,
    agentProvider: payload.agentProvider ?? null,
    agentModel: payload.agentModel ?? null,
    failureKind: null,
    message: 'Garden AI is configured.',
  };
}

export function requestFailedDiagnostics(): GardenAgentDiagnostics {
  return {
    apiReachable: true,
    agentConfigured: true,
    failureKind: 'request_failed',
    message: 'AI request failed; try again.',
  };
}

export function apiUnreachableDiagnostics(): GardenAgentDiagnostics {
  return {
    apiReachable: false,
    agentConfigured: null,
    failureKind: 'api_unreachable',
    message: 'Garden API is unreachable from this device.',
  };
}

export class GardenAgentDiagnosticsService {
  async checkHealth(): Promise<GardenAgentDiagnostics> {
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (!response.ok) return apiUnreachableDiagnostics();
      const payload = (await response.json()) as HealthPayload;
      return classifyHealthResponse(payload);
    } catch {
      return apiUnreachableDiagnostics();
    }
  }
}

export const gardenAgentDiagnosticsService = new GardenAgentDiagnosticsService();
