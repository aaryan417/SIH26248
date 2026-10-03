import { MOCK_SCENARIOS } from '../../mocks/fixtures';
import { Scenario } from '../../types';

export interface ScenarioService {
  getScenarios(): Promise<Scenario[]>;
  getScenario(id: string): Promise<Scenario>;
}

export class MockScenarioAdapter implements ScenarioService {
  private scenarios: Scenario[] = MOCK_SCENARIOS;

  public async getScenarios(): Promise<Scenario[]> {
    // Simulate slight network latency
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...this.scenarios];
  }

  public async getScenario(id: string): Promise<Scenario> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const found = this.scenarios.find((s) => s.id === id);
    if (!found) {
      throw new Error(`Scenario with ID ${id} not found.`);
    }
    return { ...found };
  }
}

// Future Django REST implementation template:
export class HttpScenarioAdapter implements ScenarioService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async getScenarios(): Promise<Scenario[]> {
    const res = await fetch(`${this.baseUrl}/scenarios/`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return res.json();
  }

  public async getScenario(id: string): Promise<Scenario> {
    const res = await fetch(`${this.baseUrl}/scenarios/${id}/`);
    if (!res.ok) throw new Error(`Failed to fetch scenario ${id}`);
    return res.json();
  }
}

// Export singleton instance based on environment configuration
const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false';
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const scenarioService: ScenarioService = useMock
  ? new MockScenarioAdapter()
  : new HttpScenarioAdapter(apiBase);
