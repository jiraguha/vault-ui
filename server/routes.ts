import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParameterSchema } from "@shared/schema";
import { SSMClient, GetParametersByPathCommand, PutParameterCommand, DeleteParameterCommand } from "@aws-sdk/client-ssm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to create SSM client for each request
  app.use((req, res, next) => {
    const region = req.headers['x-aws-region'];
    if (region && typeof region === 'string') {
      console.log('Creating SSM client with region:', region);
      const ssm = new SSMClient({ region });
      (req as any).ssm = ssm;
    } else {
      console.log('No AWS region provided, falling back to in-memory storage');
    }
    next();
  });

  // Get all parameters in a namespace
  app.get("/api/parameters/:namespace", async (req, res) => {
    try {
      const { namespace } = req.params;
      const ssm = (req as any).ssm;
      console.log(`Fetching parameters for namespace: ${namespace}`);

      if (!ssm) {
        console.log('Using in-memory storage');
        const parameters = await storage.getParameters(namespace);
        return res.json(parameters);
      }

      const command = new GetParametersByPathCommand({
        Path: `/${namespace}`,
        Recursive: true,
        WithDecryption: true,
      });

      console.log('Sending AWS SSM request');
      const response = await ssm.send(command);
      const parameters = response.Parameters?.map(param => ({
        id: Date.now(), // Use timestamp as ID
        name: param.Name?.split('/').pop() || '',
        value: param.Value || '',
        isSecure: param.Type === 'SecureString',
        version: param.Version || 1,
      })) || [];

      res.json(parameters);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      res.status(500).json({ message: "Failed to fetch parameters" });
    }
  });

  // Create a new parameter
  app.post("/api/parameters/:namespace/variables", async (req, res) => {
    try {
      const { namespace } = req.params;
      const result = insertParameterSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const ssm = (req as any).ssm;
      if (!ssm) {
        const parameter = await storage.createParameter(result.data);
        return res.status(201).json(parameter);
      }

      const command = new PutParameterCommand({
        Name: `/${namespace}/${result.data.name}`,
        Value: result.data.value,
        Type: result.data.isSecure ? 'SecureString' : 'String',
        Overwrite: false,
      });

      await ssm.send(command);
      res.status(201).json({ message: "Parameter created" });
    } catch (error) {
      console.error('Error creating parameter:', error);
      res.status(500).json({ message: "Failed to create parameter" });
    }
  });

  // Update a parameter
  app.patch("/api/parameters/:namespace/variables/:name", async (req, res) => {
    try {
      const { namespace, name } = req.params;
      const result = insertParameterSchema.partial().safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const ssm = (req as any).ssm;
      if (!ssm) {
        try {
          const parameter = await storage.updateParameter(Number(name), result.data);
          return res.json(parameter);
        } catch (error) {
          return res.status(404).json({ message: "Parameter not found" });
        }
      }

      const command = new PutParameterCommand({
        Name: `/${namespace}/${name}`,
        Value: result.data.value,
        Type: result.data.isSecure ? 'SecureString' : 'String',
        Overwrite: true,
      });

      await ssm.send(command);
      res.json({ message: "Parameter updated" });
    } catch (error) {
      console.error('Error updating parameter:', error);
      res.status(500).json({ message: "Failed to update parameter" });
    }
  });

  // Delete a parameter
  app.delete("/api/parameters/:namespace/variables/:name", async (req, res) => {
    try {
      const { namespace, name } = req.params;
      const ssm = (req as any).ssm;

      if (!ssm) {
        try {
          await storage.deleteParameter(Number(name));
          return res.status(204).end();
        } catch (error) {
          return res.status(404).json({ message: "Parameter not found" });
        }
      }

      const command = new DeleteParameterCommand({
        Name: `/${namespace}/${name}`,
      });

      await ssm.send(command);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting parameter:', error);
      res.status(500).json({ message: "Failed to delete parameter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}