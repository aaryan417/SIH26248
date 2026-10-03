/**
 * Django REST Framework & Django Channels API Specification
 * Problem Statement: SIH26248
 * MoD Defence Services Staff College Trainer
 */

export const API_CONTRACT_DOCUMENTATION = {
  version: 'v1',
  baseUrl: '/api/v1',
  wsUrl: '/ws/sessions/{sessionId}/',
  endpoints: [
    {
      method: 'POST',
      path: '/auth/login/',
      description: 'Authenticate instructor or trainee user',
    },
    {
      method: 'GET',
      path: '/scenarios/',
      description: 'List available fictional training scenarios',
    },
    {
      method: 'GET',
      path: '/scenarios/{id}/',
      description: 'Retrieve detailed scenario metadata and event timeline',
    },
    {
      method: 'POST',
      path: '/sessions/',
      description: 'Create a new exercise session instance',
    },
    {
      method: 'GET',
      path: '/sessions/{id}/',
      description: 'Fetch current state of exercise session',
    },
    {
      method: 'POST',
      path: '/sessions/{id}/start/',
      description: 'Start or resume exercise simulation clock',
    },
    {
      method: 'POST',
      path: '/sessions/{id}/pause/',
      description: 'Pause exercise simulation clock',
    },
    {
      method: 'POST',
      path: '/sessions/{id}/end/',
      description: 'Terminate exercise and trigger AAR calculation',
    },
    {
      method: 'GET',
      path: '/sessions/{id}/participants/',
      description: 'Retrieve active participant connection and information states',
    },
    {
      method: 'POST',
      path: '/sessions/{id}/events/',
      description: 'Inject instructor events or log scenario updates',
    },
    {
      method: 'POST',
      path: '/sessions/{id}/decisions/',
      description: 'Submit trainee decision option and rationale',
    },
    {
      method: 'GET',
      path: '/sessions/{id}/aar/',
      description: 'Retrieve compiled After Action Review analytics and timeline',
    },
  ],
  websocketTopics: [
    'session.state_update',
    'session.event_log',
    'comm.status_change',
    'comm.message_delivered',
    'decision.required',
    'decision.submitted',
    'team.participant_update',
  ],
};
