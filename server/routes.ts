import type { Express } from "express";
import { createServer, type Server } from "http";
import { SSMClient, GetParametersByPathCommand, PutParameterCommand, DeleteParameterCommand } from "@aws-sdk/client-ssm";

export async function registerRoutes(app: Express, ssmClient: SSMClient): Promise<Server> {
  // Get all parameters
  app.get("/api/parameters", async (_req, res) => {
    try {
      console.log('Fetching all parameters');

      // Group parameters by namespace
      const parametersByNamespace: Record<string, any[]> = {};
      let nextToken: string | undefined;

      // Use pagination to get all parameters
      do {
        const command = new GetParametersByPathCommand({
          Path: '/',  // Specify the root path for parameters
          Recursive: true,
          WithDecryption: true,
          MaxResults: 10,  // AWS SSM limits to max 10 results per request
          NextToken: nextToken
        });

        const response = await ssmClient.send(command);
        nextToken = response.NextToken;

        // Process current batch of parameters
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
            id: fullPath, // Use timestamp as ID
            name: paramName,
            value: param.Value || '',
            isSecure: param.Type === 'SecureString',
            version: param.Version || 1,
          });
        });
      } while (nextToken);

      console.log('Parameters grouped by namespace:', {
        namespaceCount: Object.keys(parametersByNamespace).length,
        namespaces: Object.keys(parametersByNamespace),
        timestamp: new Date().toISOString()
      });

      res.json(parametersByNamespace);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      if (error instanceof Error) {
        console.error('Error details :', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch parameters" });
    }
  });

  // Create a new parameter
  app.post("/api/parameters/:namespace/variables", async (req, res) => {
    try {
      const namespace = decodeURIComponent(req.params.namespace);
      const { name, value, isSecure } = req.body;
      console.log(`Creating parameter in namespace ${namespace}:`, { name, isSecure });

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
      console.log(`Parameter created successfully: /${namespace}/${name}`);
      res.status(201).json({ message: "Parameter created" });
    } catch (error) {
      console.error('Error creating parameter:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create parameter" });
    }
  });

  // Update a parameter
  app.patch("/api/parameters/:namespace/variables/:name", async (req, res) => {
    try {
      const { namespace, name } = req.params;
      const { value, isSecure } = req.body;
      const decodedNamespace = decodeURIComponent(namespace);
      console.log(`Updating parameter: /${decodedNamespace}/${name}`);

      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      const command = new PutParameterCommand({
        Name: `/${decodedNamespace}/${name}`,  // Add /ortelius prefix
        Value: value,
        Type: isSecure ? 'SecureString' : 'String',
        Overwrite: true,
      });

      await ssmClient.send(command);
      console.log(`Parameter updated successfully: /${decodedNamespace}/${name}`);
      res.json({ message: "Parameter updated" });
    } catch (error) {
      console.error('Error updating parameter:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update parameter" });
    }
  });

  // Delete a parameter
  app.delete("/api/parameters/:namespace/variables/:name", async (req, res) => {
    try {
      const { namespace, name } = req.params;
      const decodedNamespace = decodeURIComponent(namespace);
      console.log(`Deleting parameter: /${decodedNamespace}/${name}`);

      const command = new DeleteParameterCommand({
        Name: `/${decodedNamespace}/${name}`,  // Add /ortelius prefix
      });

      await ssmClient.send(command);
      console.log(`Parameter deleted successfully: /${decodedNamespace}/${name}`);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting parameter:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete parameter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}