import { parameters, type Parameter, type InsertParameter } from "@shared/schema";

export interface IStorage {
  createParameter(parameter: InsertParameter): Promise<Parameter>;
  updateParameter(id: number, parameter: Partial<InsertParameter>): Promise<Parameter>;
  deleteParameter(id: number): Promise<void>;
}

export interface Parameter {
  id: number;
  name: string;
  value: string;
  isSecure: boolean;
  version: number;
}