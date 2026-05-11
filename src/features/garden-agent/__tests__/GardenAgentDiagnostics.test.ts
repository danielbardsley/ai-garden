import { apiUnreachableDiagnostics, classifyHealthResponse, GardenAgentDiagnosticsService, requestFailedDiagnostics } from '../GardenAgentDiagnostics';

test('classifies configured health payload', () => {
  expect(classifyHealthResponse({ agentConfigured: true, agentProvider: 'openai', agentModel: 'gpt-5.5' })).toMatchObject({
    apiReachable: true,
    agentConfigured: true,
    agentProvider: 'openai',
    agentModel: 'gpt-5.5',
    failureKind: null,
  });
});

test('classifies unconfigured health payload', () => {
  expect(classifyHealthResponse({ agentConfigured: false })).toMatchObject({
    apiReachable: true,
    agentConfigured: false,
    failureKind: 'agent_unconfigured',
    message: 'AI provider is not configured on the server.',
  });
});

test('returns API unreachable diagnostics', () => {
  expect(apiUnreachableDiagnostics()).toMatchObject({ apiReachable: false, agentConfigured: null, failureKind: 'api_unreachable' });
});

test('returns request failed diagnostics', () => {
  expect(requestFailedDiagnostics()).toMatchObject({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed' });
});

test('health service classifies non-OK response as unreachable', async () => {
  global.fetch = jest.fn(async () => ({ ok: false })) as jest.Mock;
  await expect(new GardenAgentDiagnosticsService().checkHealth()).resolves.toMatchObject({ failureKind: 'api_unreachable' });
});

test('health service classifies OK response body', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ agentConfigured: true }) })) as jest.Mock;
  await expect(new GardenAgentDiagnosticsService().checkHealth()).resolves.toMatchObject({ agentConfigured: true });
});
