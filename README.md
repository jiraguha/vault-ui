# AWS Parameter Store UI

**Stop wasting time with command-line tools. Manage your AWS Parameter Store securely and efficiently through our intuitive interface.**

A web application for managing AWS SSM Parameter Store parameters through an intuitive user interface.

## Overview

This application provides a user-friendly interface for creating, viewing, updating, and deleting parameters in AWS Systems Manager Parameter Store. It organizes parameters by namespaces in a hierarchical view, making it easier to manage large sets of configuration values across different environments.
## Features

- **Parameter Management**: Create, read, update, and delete parameters
- **Namespace Organization**: Group parameters by namespaces (e.g., "myapp/dev")
- **Secure Parameters**: Support for encrypted parameters with visibility toggle
- **Import/Export**: Import from .env files or export parameters to .env files
- **Versioning**: Track parameter versions and history
- **Hierarchical View**: Navigate parameters in a tree-like structure
- **Responsive Design**: Works on desktop and mobile devices

### Start Now with Docker/Podman

You can also run the application using Docker:

```bash
docker run --rm \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_DEFAULT_REGION=eu-west-3 \
  -p 5500:5500 jpiraguha/vault-ui:0.1.0
```

## Project Structure

- `/client` - React frontend application with TypeScript and Tailwind CSS
- `/server` - Express.js backend server that communicates with AWS SSM API
- `/shared` - Shared types and schemas used by both client and server

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS credentials with appropriate permissions for Parameter Store

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the client directory based on the example
   - Configure AWS credentials (via AWS CLI, environment variables, or IAM roles)

### Running the Application

Start the development server:

```bash
npm run dev
```

### Docker Usage

You can also run the application using Docker:

```bash
docker run --rm \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_DEFAULT_REGION=eu-west-3 \
  -p 5500:5500 jpiraguha/vault-ui:0.1.0
```

This will start the application on port 5500. Access it at http://localhost:5500 in your browser.


## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, AWS SDK
- **Data Validation**: Zod
- **State Management**: React hooks
