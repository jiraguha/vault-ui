import { parameters, type Parameter, type InsertParameter } from "@shared/schema";

export interface IStorage {
  getParameters(environment: string): Promise<Parameter[]>;
  createParameter(parameter: InsertParameter): Promise<Parameter>;
  updateParameter(id: number, parameter: Partial<InsertParameter>): Promise<Parameter>;
  deleteParameter(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private parameters: Map<number, Parameter>;
  private currentId: number;

  constructor() {
    this.parameters = new Map();
    this.currentId = 1;
  }

  async getParameters(environment: string): Promise<Parameter[]> {
    return Array.from(this.parameters.values()).filter(
      (param) => param.environment === environment,
    );
  }

  async createParameter(insertParameter: InsertParameter): Promise<Parameter> {
    const id = this.currentId++;
    const parameter: Parameter = { ...insertParameter, id };
    this.parameters.set(id, parameter);
    return parameter;
  }

  async updateParameter(id: number, updateParam: Partial<InsertParameter>): Promise<Parameter> {
    const parameter = this.parameters.get(id);
    if (!parameter) {
      throw new Error("Parameter not found");
    }
    const updatedParameter = { ...parameter, ...updateParam };
    this.parameters.set(id, updatedParameter);
    return updatedParameter;
  }

  async deleteParameter(id: number): Promise<void> {
    if (!this.parameters.delete(id)) {
      throw new Error("Parameter not found");
    }
  }
}

export const storage = new MemStorage();
