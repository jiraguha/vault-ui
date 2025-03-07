import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParameterSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/parameters/:environment", async (req, res) => {
    const { environment } = req.params;
    const parameters = await storage.getParameters(environment);
    res.json(parameters);
  });

  app.post("/api/parameters", async (req, res) => {
    const result = insertParameterSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }
    const parameter = await storage.createParameter(result.data);
    res.status(201).json(parameter);
  });

  app.patch("/api/parameters/:id", async (req, res) => {
    const { id } = req.params;
    const result = insertParameterSchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }
    try {
      const parameter = await storage.updateParameter(Number(id), result.data);
      res.json(parameter);
    } catch (error) {
      res.status(404).json({ message: "Parameter not found" });
    }
  });

  app.delete("/api/parameters/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await storage.deleteParameter(Number(id));
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ message: "Parameter not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
