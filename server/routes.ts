import type { Express } from "express";
import { createServer, type Server } from "http";
import { SSMClient, GetParametersByPathCommand, PutParameterCommand, DeleteParameterCommand } from "@aws-sdk/client-ssm";

// Create a single SSM client instance
const ssmClient = new SSMClient({ 
  region: process.env.AWS_REGION || 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Mock data for fallback when AWS is not available
const mockData = {
  "ortelius/dev": [
    { id: 1, name: "PORT", value: "3001", isSecure: false, version: 1 },
    { id: 2, name: "AWS_S3_SECRET_ACCESS_KEY", value: "supersecret", isSecure: true, version: 3 },
  ],
  "ortelius/prod": [
    { id: 1, name: "PORT", value: "3001", isSecure: false, version: 1 },
    { id: 2, name: "AWS_S3_SECRET_ACCESS_KEY", value: "supersecret2", isSecure: true, version: 3 }
  ],
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all parameters
  app.get("/api/parameters", async (_req, res) => {
    try {
      console.log('Fetching all parameters');

      const command = new GetParametersByPathCommand({
        Path: '/',
        Recursive: true,
        WithDecryption: true,
      });

      console.log('Sending AWS SSM request');
      const response = await ssmClient.send(command);

      // Group parameters by namespace
      const parametersByNamespace: Record<string, any[]> = {};

      response.Parameters?.forEach(param => {
        const fullPath = param.Name || '';
        // Remove the leading slash and get the namespace (everything before the last segment)
        const parts = fullPath.substring(1).split('/');
        const paramName = parts.pop() || '';
        const namespace = parts.join('/');

        if (!parametersByNamespace[namespace]) {
          parametersByNamespace[namespace] = [];
        }

        parametersByNamespace[namespace].push({
          id: Date.now(), // Use timestamp as ID
          name: paramName,
          value: param.Value || '',
          isSecure: param.Type === 'SecureString',
          version: param.Version || 1,
        });
      });

      res.json(parametersByNamespace);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      // Fallback to mock data if AWS is not available
      console.log('Falling back to mock data');
      res.json(mockData);
    }
  });

  // Create a new parameter
  app.post("/api/parameters/:namespace/variables", async (req, res) => {
    try {
      const { namespace } = req.params;
      const { name, value, isSecure } = req.body;

      if (!name || !value) {
        return res.status(400).json({ message: "Name and value are required" });
      }

      const command = new PutParameterCommand({
        Name: `/${namespace}/${name}`,
        Value: value,
        Type: isSecure ? 'SecureString' : 'String',
        Overwrite: false,
      });

      await ssmClient.send(command);
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
      const { value, isSecure } = req.body;

      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      const command = new PutParameterCommand({
        Name: `/${namespace}/${name}`,
        Value: value,
        Type: isSecure ? 'SecureString' : 'String',
        Overwrite: true,
      });

      await ssmClient.send(command);
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

      const command = new DeleteParameterCommand({
        Name: `/${namespace}/${name}`,
      });

      await ssmClient.send(command);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting parameter:', error);
      res.status(500).json({ message: "Failed to delete parameter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}