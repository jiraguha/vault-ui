import { type Parameter } from "@shared/schema";

interface Store {
  [key: string]: Parameter[];
}

export const createMockApiClient = () => {
  const store: Store = {
    "ortelius/dev": [
      { id: 1, name: "PORT", value: "3001", isSecure: false, version: 1 },
      { id: 2, name: "AWS_S3_SECRET_ACCESS_KEY", value: "supersecret", isSecure: true, version: 3 },
    ],
    "ortelius/prod": [
      { id: 1, name: "PORT", value: "3001", isSecure: false, version: 1 },
      { id: 2, name: "AWS_S3_SECRET_ACCESS_KEY", value: "supersecret2", isSecure: true, version: 3 }
    ],
  };

  return {
    fetchNamespaces: async () => {
      console.log("fetchNamespaces");
      return new Promise<Store>((resolve) => setTimeout(() => resolve(store), 200));
    },
    createNamespaceWithVariable: async (namespace: string, variable: Omit<Parameter, "id" | "version">) => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (store[namespace]) {
            reject(new Error("Namespace already exists"));
          } else {
            store[namespace] = [{
              ...variable,
              id: 1,
              version: 1
            }];
            resolve();
          }
        }, 200);
      });
    },
    addVariable: async (namespace: string, variable: Omit<Parameter, "id" | "version">) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          store[namespace] = store[namespace] || [];
          const newVariable = { 
            ...variable, 
            id: Math.max(0, ...store[namespace].map(p => p.id)) + 1,
            version: 1 
          };
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
    updateVariable: async (namespace: string, paramName: string, updates: Partial<Parameter>) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const param = store[namespace].find(p => p.name === paramName);
          if (param) {
            const updatedParam = { 
              ...param, 
              ...updates,
              version: (param.version || 0) + 1 
            };
            store[namespace] = store[namespace].map(p => 
              p.name === paramName ? updatedParam : p
            );
          }
          resolve();
        }, 200);
      });
    },
  };
};

export type MockApiClient = ReturnType<typeof createMockApiClient>;