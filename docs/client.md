# Client Documentation

## Overview

The client application is a React-based frontend for the Vault UI. It provides an intuitive user interface for managing AWS SSM parameters through a web browser.

## Architecture

The client application follows a component-based architecture using React and TypeScript. It uses:

- **React** for UI components and state management
- **TypeScript** for type safety and improved developer experience
- **Tailwind CSS** for responsive styling
- **shadcn/ui** for consistent UI components
- **AWS SDK** for browser for interacting with AWS services

## Key Components

### Parameters View

The main view of the application that displays parameters in a hierarchical structure organized by namespaces.

### Parameter Form

A form component for creating and editing parameters, with support for secure (encrypted) parameters.

### Parameter Table

A table component for displaying parameters with sorting, filtering, and pagination capabilities.

### Environment Selector

A component for switching between different environments (e.g., development, staging, production).

### Import/Export Tools

Components for importing parameters from .env files and exporting parameters to .env format.

## API Client

The application uses an API client to communicate with the backend. There are two implementations:

1. `AWSApiClient` - For production use with AWS SSM Parameter Store
2. `MockApiClient` - For development and testing without AWS credentials

## State Management

The application uses React's built-in state management hooks:

- `useState` for component-level state
- `useContext` for sharing state across components
- Custom hooks for encapsulating complex state logic

## Environment Variables

The client requires the following environment variables:

- `VITE_AWS_API_URL` - The URL of the AWS API (default: http://localhost:5500)
- `VITE_AWS_REGION` - The AWS region (default: eu-west-3)

## Building for Production

To build the client for production:

```bash
npm run build
```

This will create a production-ready build in the `dist` directory that can be deployed to a static hosting service.
