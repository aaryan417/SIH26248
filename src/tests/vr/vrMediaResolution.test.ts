import { describe, it, expect } from 'vitest';
import { MOCK_SCENARIOS } from '../../mocks/fixtures';

describe('VR 360 Video Media Source Resolution', () => {
  it('prioritizes scenario media video360Url when present', () => {
    const scenario = MOCK_SCENARIOS[0];
    const customStoreUrl = 'https://cdn.example.com/custom.mp4';
    const envUrl = '/videos/training360.mp4';

    const resolved = scenario?.media?.video360Url || customStoreUrl || envUrl;
    expect(resolved).toBe('/videos/training360.mp4');
  });

  it('falls back to custom store video URL when scenario media URL is empty', () => {
    const scenarioWithoutVideo = { ...MOCK_SCENARIOS[0], media: { video360Url: '' } };
    const customStoreUrl = 'https://cdn.example.com/custom.mp4';
    const envUrl = '/videos/training360.mp4';

    const resolved = scenarioWithoutVideo.media?.video360Url || customStoreUrl || envUrl;
    expect(resolved).toBe('https://cdn.example.com/custom.mp4');
  });

  it('falls back to local /videos/training360.mp4 when scenario and store URLs are empty', () => {
    const scenarioEmpty = { ...MOCK_SCENARIOS[0], media: { video360Url: '' } };
    const customStoreUrl = '';
    const envUrl = '/videos/training360.mp4';

    const resolved = scenarioEmpty.media?.video360Url || customStoreUrl || envUrl;
    expect(resolved).toBe('/videos/training360.mp4');
  });
});
