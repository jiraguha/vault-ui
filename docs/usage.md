# Usage Guide

## Introduction

This guide explains how to use the Vault UI to manage your application parameters in AWS Systems Manager Parameter Store.

## Getting Started

1. **AWS Credentials**: Ensure you have valid AWS credentials with permissions to access SSM Parameter Store
2. **Access the UI**: Open the application in your web browser
3. **Navigation**: The main dashboard shows your parameters organized in a hierarchical tree view

## Managing Parameters

### Viewing Parameters

Parameters are displayed in a hierarchical tree structure:
- Parameters are grouped by namespaces (e.g., `/myapp/dev/database`)
- Clicking on a namespace expands it to show contained parameters
- Secure parameters are indicated with a lock icon
- Parameter values, types, and versions are displayed in the table

### Creating Parameters

To create a new parameter:

1. Navigate to the desired namespace or create a new one
2. Click the "Add Parameter" button
3. Fill in the parameter details:
   - Name (required)
   - Value (required)
   - Type (String, SecureString, or StringList)
   - Description (optional)
4. Click "Save"

### Editing Parameters

To edit an existing parameter:

1. Find the parameter in the tree view
2. Click the "Edit" button
3. Modify the parameter details
4. Click "Save" to create a new version

### Deleting Parameters

To delete a parameter:

1. Find the parameter in the tree view
2. Click the "Delete" button
3. Confirm the deletion

## Working with Secure Parameters

The system supports secure (encrypted) parameters:

1. When creating a parameter, select "SecureString" as the type
2. The value will be encrypted using the default AWS KMS key
3. Secure parameter values are hidden by default in the UI
4. Click the "Show/Hide" toggle to view secure values

## Importing and Exporting

### Importing Parameters

To import parameters from a .env file:

1. Click the "Import" button
2. Select the target namespace
3. Paste the .env file content or upload a file
4. Select the parameter type (String or SecureString)
5. Click "Import"

### Exporting Parameters

To export parameters to a .env file:

1. Navigate to the namespace you want to export
2. Click the "Export" button
3. The parameters will be formatted as KEY=value pairs
4. Save the content to a .env file

## Parameter Versioning

The system tracks versions of parameters:

1. Each update creates a new version
2. Version history can be viewed by clicking "History"
3. The current version number is displayed in the parameter list

## Best Practices

1. **Hierarchical Structure**: Use a consistent hierarchy like `/application/environment/component/parameter`
2. **Secure Parameters**: Use SecureString type for sensitive values like API keys and passwords
3. **Descriptions**: Add clear descriptions to document the purpose of each parameter
4. **Namespaces**: Group related parameters in logical namespaces
5. **Versioning**: Review parameter history before making changes to critical values
