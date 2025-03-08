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
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }


  private async makeRequest(path: string, options?: RequestInit) {
    try {
      const url = `${this.baseUrl}${path}`;
      console.log('Making request to:', url);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Network request failed');
      }

      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}. Please check if the server is running.`);
      }
      throw error;
    }
  }

  async fetchNamespaces(): Promise<Record<string, Parameter[]>> {
    try {
      const response = await this.makeRequest('/api/parameters');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
      throw error;
    }
  }

  async createNamespaceWithVariable(namespace: string, variable: Omit<Parameter, "id" | "version">): Promise<void> {
    const encodedNamespace = encodeURIComponent(namespace);
    await this.makeRequest(`/api/parameters/${encodedNamespace}/variables`, {
      method: 'POST',
      body: JSON.stringify(variable),
    });
  }

  async addVariable(namespace: string, variable: Omit<Parameter, "id" | "version">): Promise<void> {
    const encodedNamespace = encodeURIComponent(namespace);
    await this.makeRequest(`/api/parameters/${encodedNamespace}/variables`, {
      method: 'POST',
      body: JSON.stringify(variable),
    });
  }

  async updateVariable(namespace: string, paramName: string, updates: Partial<Parameter>): Promise<void> {
    const encodedNamespace = encodeURIComponent(namespace);
    await this.makeRequest(`/api/parameters/${encodedNamespace}/variables/${paramName}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteVariable(namespace: string, paramName: string): Promise<void> {
    const encodedNamespace = encodeURIComponent(namespace);
    await this.makeRequest(`/api/parameters/${encodedNamespace}/variables/${paramName}`, {
      method: 'DELETE',
    });
  }
}

export function createApiClient(config?: { baseUrl: string }): ApiClient {
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