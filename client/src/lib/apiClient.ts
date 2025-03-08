import { type Parameter } from "@shared/schema";
import { createMockApiClient } from "./mockApiClient";

export interface ApiClient {
  fetchNamespaces: () => Promise<Record<string, Parameter[]>>;
  createNamespaceWithVariable: (namespace: string, variable: Omit<Parameter, "id" | "version">) => Promise<void>;
  addVariable: (namespace: string, variable: Omit<Parameter, "id" | "version">) => Promise<void>;
  deleteVariable: (namespace: string, paramName: string) => Promise<void>;
  updateVariable: (namespace: string, paramName: string, updates: Partial<Parameter>) => Promise<void>;
}

export class AWSApiClient implements ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl) {
      throw new Error("AWS API client requires baseUrl");
    }
    this.baseUrl = baseUrl;
  }

  async fetchNamespaces(): Promise<Record<string, Parameter[]>> {
    try {
      const namespaces = ['ortelius/dev', 'ortelius/prod'];
      const result: Record<string, Parameter[]> = {};

      for (const namespace of namespaces) {
        const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}`);

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`Failed to fetch namespace ${namespace}: ${error.message}`);
        }

        const parameters = await response.json();
        result[namespace] = parameters;
      }

      return result;
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      throw error;
    }
  }

  async createNamespaceWithVariable(namespace: string, variable: Omit<Parameter, "id" | "version">): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variable),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to create namespace: ${error.message}`);
    }
  }

  async addVariable(namespace: string, variable: Omit<Parameter, "id" | "version">): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variable),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to add variable: ${error.message}`);
    }
  }

  async updateVariable(namespace: string, paramName: string, updates: Partial<Parameter>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables/${paramName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to update variable: ${error.message}`);
    }
  }

  async deleteVariable(namespace: string, paramName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables/${paramName}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to delete variable: ${error.message}`);
    }
  }
}

export function createApiClient(config?: { baseUrl: string }): ApiClient {
  // Log configuration for debugging
  console.log('AWS Config:', {
    provided: !!config,
    baseUrl: config?.baseUrl || 'not provided'
  });

  if (!config?.baseUrl) {
    console.warn('Missing AWS configuration, falling back to Mock API Client');
    return createMockApiClient();
  }

  console.log('Using AWS API Client');
  return new AWSApiClient(config.baseUrl);
}