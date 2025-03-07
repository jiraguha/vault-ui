import { type Parameter } from "@shared/schema";

interface Store {
  [key: string]: Parameter[];
}

export const createMockApiClient = () => {
  const store: Store = {
    "ortelius/dev": [
      { id: 1, name: "PORT", value: "3001", isSecure: false, environment: "development" },
      { id: 2, name: "AWS_S3_SECRET_ACCESS_KEY", value: "supersecret", isSecure: true, environment: "development" },
    ],
  };

  return {
    fetchNamespaces: async () => {
      return new Promise<Store>((resolve) => setTimeout(() => resolve(store), 200));
    },
    addVariable: async (namespace: string, variable: Omit<Parameter, "id">) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          store[namespace] = store[namespace] || [];
          const newVariable = { ...variable, id: Math.max(0, ...store[namespace].map(p => p.id)) + 1 };
          store[namespace].push(newVariable);
          resolve();
        }, 200);
      });
    },
    deleteVariable: async (namespace: string, paramName: string) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          store[namespace] = store[namespace].filter((param) => param.name !== paramName);
          resolve();
        }, 200);
      });
    },
  };
};

export type MockApiClient = ReturnType<typeof createMockApiClient>;
