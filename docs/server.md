# Server Documentation

## Overview

The server component provides the API endpoints for the Vault UI. It handles requests from the client application and interacts with the AWS Systems Manager Parameter Store service.

## Architecture

The server is built using Node.js and Express. It follows a RESTful API design pattern and uses the AWS SDK to communicate with AWS services.

## API Endpoints

### Parameters

- `GET /api/parameters` - Get all parameters
- `GET /api/parameters/:namespace` - Get parameters by namespace
- `POST /api/parameters/:namespace` - Create a new parameter in a namespace
- `PUT /api/parameters/:namespace/:name` - Update a parameter
- `DELETE /api/parameters/:namespace/:name` - Delete a parameter

### Additional Endpoints

- `POST /api/parameters/import` - Import parameters from .env format
- `GET /api/parameters/export/:namespace` - Export parameters to .env format
- `GET /api/parameters/:name/history` - Get parameter version history

## AWS Integration

The server uses the AWS SDK to interact with the SSM Parameter Store:

```typescript
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
```

## Data Model

The server uses the Parameter schema defined in the shared directory:

```typescript
export type Parameter = {
  id: string;
  name: string;
  value: string;
  description?: string;
  namespace: string;
  environment: string;
  version: number;
  type: "String" | "SecureString" | "StringList";
  createdAt: Date;
  updatedAt: Date;
};
```

## Error Handling

The server implements standardized error handling with appropriate HTTP status codes:

- 400 - Bad Request (invalid input)
- 403 - Forbidden (insufficient AWS permissions)
- 404 - Not Found (resource doesn't exist)
- 500 - Internal Server Error

## Configuration

The server can be configured using environment variables:

- `PORT` - The port to run the server on (default: 5500)
- `NODE_ENV` - The environment (development, production)
- `AWS_REGION` - The AWS region to use for SSM operations
- `AWS_PROFILE` - (Optional) The AWS profile to use for credentials

## Development

To run the server in development mode:

```bash
npm run dev:server
```

## Production

For production deployment, the server should be run with:

```bash
npm run start:server
```

AWS credentials should be provided through environment variables, AWS CLI configuration, or IAM roles depending on your deployment environment.
