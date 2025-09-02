# Metadata Schema Reference

> **Complete reference for metadata.schema.json validation structure**

## Overview

The metadata schema defines the structure and validation rules for workflow metadata files. Each workflow must include a `metadata.json` file that conforms to this schema.

**Schema ID**: `https://schemas.n8n-workflows.org/metadata.schema.json`  
**Schema Version**: JSON Schema Draft 07  
**Purpose**: Validate n8n workflow metadata files

## Required Fields

### Core Identification

| Field         | Type   | Constraints                        | Description                           |
| ------------- | ------ | ---------------------------------- | ------------------------------------- |
| `name`        | string | 3-100 chars, `^[A-Za-z0-9\s\-_]+$` | Human-readable workflow name          |
| `description` | string | 10-500 chars                       | Brief description of workflow purpose |
| `version`     | string | `^\d+\.\d+\.\d+$`                  | Semantic version (e.g., 1.2.3)        |

## Optional Metadata Fields

### Author & Versioning

```json
{
  "tags": ["csv", "transformation", "data"],
  "author": "data-team",
  "created": "2024-01-15",
  "updated": "2024-08-20",
  "n8n_version": "1.45.0"
}
```

### Requirements & Dependencies

```json
{
  "requirements": {
    "credentials": ["slack", "webhook"],
    "nodes": ["Webhook", "Code", "If", "Respond to Webhook"],
    "environment_variables": ["API_KEY", "BASE_URL"],
    "external_services": ["Slack API", "CRM System"]
  }
}
```

### Operational Characteristics

```json
{
  "triggers": ["webhook", "schedule"],
  "complexity": "medium",
  "execution_time": "5-15 seconds",
  "resources": {
    "memory": "low",
    "cpu": "medium",
    "storage": "minimal",
    "network": "medium"
  },
  "business_impact": "medium"
}
```

### Maintenance & Support

```json
{
  "maintenance": {
    "frequency": "monthly",
    "last_reviewed": "2024-08-20",
    "next_review": "2024-09-20",
    "support_contact": "data-team@company.com"
  }
}
```

### Testing Configuration

```json
{
  "testing": {
    "test_data_required": true,
    "test_environment": "development",
    "validation_steps": [
      "Send POST request with sample CSV data",
      "Verify JSON response structure"
    ],
    "known_issues": ["Large CSV files (>10MB) may cause timeout"]
  }
}
```

### Security & Compliance

```json
{
  "security": {
    "data_sensitivity": "internal",
    "compliance_requirements": ["GDPR", "SOC2"],
    "security_review_required": false
  }
}
```

## Enumerated Values

### Complexity Levels

- `low` - Simple, single-step operations
- `medium` - Multi-step with some logic
- `high` - Complex logic, multiple integrations
- `very-high` - Enterprise-level complexity

### Resource Usage Levels

- `minimal` - Very low resource usage
- `low` - Light resource usage
- `medium` - Moderate resource usage
- `high` - Heavy resource usage
- `very-high` - Maximum resource usage

### Trigger Types

- `webhook` - HTTP webhook trigger
- `schedule` - Time-based trigger
- `manual` - Manual execution
- `email` - Email-based trigger
- `file-system` - File system events
- `database` - Database changes
- `queue` - Message queue events
- `form` - Form submissions
- `chat` - Chat/messaging triggers
- `sms` - SMS triggers
- `api` - API-based triggers

### Business Impact Levels

- `low` - Minor impact if fails
- `medium` - Moderate business impact
- `high` - Significant business impact
- `critical` - Critical business process

### Data Sensitivity Levels

- `public` - Publicly available data
- `internal` - Internal company data
- `confidential` - Sensitive business data
- `restricted` - Highly sensitive data

### Compliance Requirements

- `GDPR` - General Data Protection Regulation
- `HIPAA` - Health Insurance Portability and Accountability Act
- `SOX` - Sarbanes-Oxley Act
- `PCI-DSS` - Payment Card Industry Data Security Standard
- `SOC2` - Service Organization Control 2
- `ISO27001` - Information Security Management

## Advanced Features

### Changelog Structure

```json
{
  "changelog": [
    {
      "version": "1.2.0",
      "date": "2024-08-20",
      "changes": ["Added data validation step", "Improved error handling"],
      "breaking_changes": false
    }
  ]
}
```

### Documentation URLs

```json
{
  "documentation_urls": [
    "https://internal-docs.company.com/workflows/csv-transformer",
    "https://wiki.company.com/data-processing"
  ]
}
```

## Validation Rules

### String Patterns

- **Name**: Alphanumeric with spaces, hyphens, underscores

- **Version**: Semantic versioning (major.minor.patch)
- **Environment Variables**: UPPERCASE_SNAKE_CASE
- **Tags**: Lowercase with hyphens only

### Array Constraints

- **Tags**: Maximum 10 unique items, 2-30 chars each
- **Credentials**: Unique items, 2-50 chars each
- **Nodes**: Unique items, 2-50 chars each
- **Environment Variables**: Unique UPPERCASE items

### Date Formats

All dates must follow ISO 8601 format: `YYYY-MM-DD`

## Usage Examples

### Minimal Valid Metadata

```json
{
  "name": "Simple Data Processor",
  "description": "Processes incoming data and validates format",
  "version": "1.0.0"
}
```

### Complete Enterprise Metadata

```json
{
  "name": "Enterprise CRM Synchronization",
  "description": "Bidirectional synchronization between CRM systems with conflict resolution",
  "version": "2.1.0",

  "tags": ["crm", "sync", "enterprise", "bidirectional"],
  "author": "integration-team",
  "created": "2024-01-01",
  "updated": "2024-08-30",
  "n8n_version": "1.45.0",
  "requirements": {
    "credentials": ["salesforce", "hubspot", "webhook"],
    "nodes": ["Webhook", "HTTP Request", "Code", "Switch"],
    "environment_variables": ["SYNC_INTERVAL", "CONFLICT_RESOLUTION"],
    "external_services": ["Salesforce API", "HubSpot API"]
  },
  "triggers": ["schedule", "webhook"],
  "complexity": "high",
  "execution_time": "2-5 minutes",
  "resources": {
    "memory": "medium",
    "cpu": "high",
    "storage": "low",
    "network": "high"
  },
  "business_impact": "critical",
  "maintenance": {
    "frequency": "weekly",
    "last_reviewed": "2024-08-30",
    "next_review": "2024-09-06",
    "support_contact": "integration-team@company.com"
  },
  "testing": {
    "test_data_required": true,
    "test_environment": "staging",
    "validation_steps": [
      "Create test records in both CRMs",
      "Trigger sync workflow",
      "Verify bidirectional synchronization",
      "Test conflict resolution logic"
    ],
    "known_issues": [
      "Rate limits may cause delays during bulk operations",
      "Conflict resolution requires manual review for complex cases"
    ]
  },
  "security": {
    "data_sensitivity": "confidential",
    "compliance_requirements": ["GDPR", "SOC2"],
    "security_review_required": true
  },
  "documentation_urls": ["https://docs.company.com/integrations/crm-sync"],
  "changelog": [
    {
      "version": "2.1.0",
      "date": "2024-08-30",
      "changes": [
        "Added conflict resolution logic",
        "Improved error handling and retry mechanism",
        "Enhanced logging for debugging"
      ],
      "breaking_changes": false
    }
  ]
}
```

## Validation Script Integration

The metadata schema is enforced by `/scripts/validate-workflow.js`:

```javascript
// Schema validation using AJV
if (this.metadataSchema && !this.ajv.validate(this.metadataSchema, metadata)) {
  results.errors.push(
    `Metadata schema validation failed: ${this.ajv.errorsText()}`,
  );
  results.valid = false;
}
```

### Common Validation Errors

1. **Missing required fields** - name, description, version
2. **Invalid version format** - must be semantic versioning

3. **Tag constraints** - maximum 10 unique items
4. **Date format** - must be YYYY-MM-DD
5. **Environment variable format** - must be UPPERCASE_SNAKE_CASE

---

_Schema reference generated on: 2024-09-01_  
_For the latest schema definition, see [schemas/metadata.schema.json](../schemas/metadata.schema.json)_
