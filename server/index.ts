import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { SSMClient } from "@aws-sdk/client-ssm";
import cors from 'cors';

// Validate AWS credentials before starting the server
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS credentials are not configured!');
  console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  process.exit(1);
}

// Validate AWS region
const region = process.env.AWS_REGION || 'eu-west-3';
console.log('AWS Configuration:', {
  accessKeyIdPresent: !!process.env.AWS_ACCESS_KEY_ID,
  secretAccessKeyPresent: !!process.env.AWS_SECRET_ACCESS_KEY,
  region,
});

console.log('Creating AWS SSM client...');
const ssmClient = new SSMClient({ 
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
console.log('AWS SSM client created successfully');

const app = express();

// CORS configuration must come before any routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app, ssmClient);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Server error:', err);
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log('AWS Environment:', {
      region: process.env.AWS_REGION || 'eu-west-3',
      accessKeyIdLength: process.env.AWS_ACCESS_KEY_ID?.length || 0,
      secretAccessKeyLength: process.env.AWS_SECRET_ACCESS_KEY?.length || 0
    });

    console.log('Using AWS SSM Client with configuration:', {
      region,
      baseUrl: "http://localhost:5000"
    });

    log(`Server is running on port ${port}`);
  });
})();