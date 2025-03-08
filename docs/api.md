# API Documentation

## Base URL

The base URL for all API endpoints is defined in the client's environment variables:

```
VITE_AWS_API_URL=http://localhost:5500
```

## Authentication

API requests to AWS Parameter Store require AWS authentication. The server handles AWS authentication using credentials from:

- Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- AWS credentials file (~/.aws/credentials)
- IAM roles (when deployed to AWS services like EC2 or ECS)

## Endpoints

### Get All Parameters

Retrieves all parameters across all namespaces.

- **URL**: `/api/parameters`
- **Method**: `GET`
- **Query Parameters**:
  - `recursive` - (Optional) Boolean to retrieve parameters recursively
  - `path` - (Optional) Path prefix to filter parameters
- **Response**: Array of Parameter objects

Example Response:
```json
[
  {
    "id": "/myapp/dev/database/url",
    "name": "DATABASE_URL",
    "value": "postgres://user:password@localhost:5432/db",
    "description": "Database connection string",
    "namespace": "/myapp/dev/database",
    "environment": "dev",
    "type": "SecureString",
    "version": 3,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
]
```

### Get Parameters by Namespace

Retrieves all parameters in a specific namespace.

- **URL**: `/api/parameters/:namespace`
- **Method**: `GET`
- **URL Parameters**: `namespace` - The namespace to retrieve parameters from
- **Query Parameters**:
  - `recursive` - (Optional) Boolean to retrieve parameters recursively
- **Response**: Array of Parameter objects

### Create Parameter

Creates a new parameter in a namespace.

- **URL**: `/api/parameters/:namespace`
- **Method**: `POST`
- **URL Parameters**: `namespace` - The namespace to create the parameter in
- **Request Body**: Parameter object without id and version

Example Request:
```json
{
  "name": "API_KEY",
  "value": "abc123",
  "description": "API key for external service",
  "type": "SecureString"
}
```

### Update Parameter

Updates an existing parameter.

- **URL**: `/api/parameters/:namespace/:name`
- **Method**: `PUT`
- **URL Parameters**: 
  - `namespace` - The namespace of the parameter
  - `name` - The name of the parameter
- **Request Body**: Partial Parameter object with fields to update

### Delete Parameter

Deletes a parameter.

- **URL**: `/api/parameters/:namespace/:name`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `namespace` - The namespace of the parameter
  - `name` - The name of the parameter

### Import Parameters

Imports parameters from .env format.

- **URL**: `/api/parameters/import`
- **Method**: `POST`
- **Request Body**:
  - `namespace` - The namespace to import parameters to
  - `content` - The .env file content as string
  - `type` - (Optional) The parameter type to use (default: "String")

### Export Parameters

Exports parameters to .env format.

- **URL**: `/api/parameters/export/:namespace`
- **Method**: `GET`
- **URL Parameters**: `namespace` - The namespace to export
- **Response**: Text content in .env format

### Get Parameter History

Retrieves the version history of a parameter.

- **URL**: `/api/parameters/:name/history`
- **Method**: `GET`
- **URL Parameters**: `name` - The full name of the parameter
- **Response**: Array of parameter versions

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: The request was invalid
- **403 Forbidden**: Insufficient AWS permissions
- **404 Not Found**: The requested resource was not found
- **500 Internal Server Error**: An unexpected error occurred

Example Error Response:
```json
{
  "error": "AccessDenied",
  "message": "User is not authorized to perform ssm:GetParameter",
  "statusCode": 403
}
```
