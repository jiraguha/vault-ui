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
  private readonly region: string;

  constructor(baseUrl: string, region: string) {
    this.baseUrl = baseUrl;
    this.region = region;
  }

  async fetchNamespaces(): Promise<Record<string, Parameter[]>> {
    try {
      const namespaces = ['ortelius/dev', 'ortelius/prod'];
      const result: Record<string, Parameter[]> = {};

      for (const namespace of namespaces) {
        const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}`, {
          headers: {
            'x-aws-region': this.region,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch namespace ${namespace}: ${response.statusText}`);
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
        'x-aws-region': this.region,
      },
      body: JSON.stringify(variable),
    });

    if (!response.ok) {
      throw new Error(`Failed to create namespace: ${response.statusText}`);
    }
  }

  async addVariable(namespace: string, variable: Omit<Parameter, "id" | "version">): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-aws-region': this.region,
      },
      body: JSON.stringify(variable),
    });

    if (!response.ok) {
      throw new Error(`Failed to add variable: ${response.statusText}`);
    }
  }

  async updateVariable(namespace: string, paramName: string, updates: Partial<Parameter>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables/${paramName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-aws-region': this.region,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update variable: ${response.statusText}`);
    }
  }

  async deleteVariable(namespace: string, paramName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/parameters/${namespace}/variables/${paramName}`, {
      method: 'DELETE',
      headers: {
        'x-aws-region': this.region,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete variable: ${response.statusText}`);
    }
  }
}

export function createApiClient(config?: { baseUrl: string; region: string }): ApiClient {
  // Log configuration for debugging
  console.log('AWS Config:', {
    provided: !!config,
    baseUrl: config?.baseUrl || 'not provided',
    region: config?.region || 'not provided'
  });

  if (config?.baseUrl && config?.region) {
    console.log('Using AWS API Client');
    return new AWSApiClient(config.baseUrl, config.region);
  }

  console.log('Falling back to Mock API Client');
  return createMockApiClient();
}