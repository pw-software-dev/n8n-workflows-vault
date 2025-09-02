# Validation API Reference

> **Complete reference for the workflow validation system and scripts**

## Overview

The validation system ensures workflow quality, consistency, and compliance through automated schema validation, structure checks, and documentation standards.

**Primary Script**: `/scripts/validate-workflow.js`  
**Dependencies**: AJV 8.17.1, ajv-formats 2.1.1  
**Node.js**: Compatible with 18+

## Core Classes

### WorkflowValidator

Main validation engine that orchestrates all validation checks.

```javascript
class WorkflowValidator {
  constructor()
  loadSchema(schemaPath)
  validateWorkflowFolder(folderPath)
  validateAllWorkflows()
  checkConsistency()
  scanAllWorkflows(callback)
}
```

#### Constructor

```javascript
const validator = new WorkflowValidator();
```

**Initialization**:

- Creates AJV instance with all errors reporting
- Loads workflow and metadata schemas
- Initializes error and warning arrays
- Configures format validation (dates, URIs)

#### Schema Loading

```javascript
loadSchema(schemaPath) → Object|null
```

**Parameters**:

- `schemaPath` (string) - Relative path to JSON schema file

**Returns**:

- Schema object if successful
- `null` if schema not found or invalid

**Behavior**:

- Graceful failure with console warnings
- JSON parsing with error handling
- File existence validation

## Validation Methods

### Single Workflow Validation

```javascript
validateWorkflowFolder(folderPath) → ValidationResult
```

**Parameters**:

- `folderPath` (string) - Path to workflow directory

**Returns**:

```javascript
{
  valid: boolean,
  errors: string[],
  warnings: string[]
}
```

**Validation Checks**:

1. **Required Files** - workflow.json, README.md, metadata.json
2. **JSON Structure** - Valid JSON parsing
3. **n8n Format** - nodes array, connections object
4. **Schema Compliance** - AJV validation against schemas
5. **README Completeness** - Required sections present
6. **Metadata Fields** - Required fields validation
7. **Version Format** - Semantic versioning compliance

### All Workflows Validation

```javascript
validateAllWorkflows() → void
```

**Process**:

1. Scans `/workflows` directory for categories
2. Iterates through each category directory
3. Validates each workflow folder
4. Aggregates results and displays summary
5. Exits with code 1 if any workflow fails

**Output Example**:

```
🔍 Validating all workflows...

Category: data-processing

Validating workflow: csv-transformer
  ✅ Valid

📊 Validation Summary:
  Valid workflows: 3
  Invalid workflows: 0
  Total workflows: 3
```

### Consistency Validation

```javascript
checkConsistency() → void
```

**Checks**:

- **Duplicate Names** - Workflow names across categories
- **Metadata Consistency** - Field format compliance
- **Cross-References** - Internal linking validation

**Process**:

1. Scans all workflows using `scanAllWorkflows()`
2. Builds map of workflow names to paths
3. Identifies duplicates and conflicts
4. Reports inconsistencies and exits with error code

## Validation Rules

### File Structure Requirements

```javascript
const requiredFiles = ["workflow.json", "README.md", "metadata.json"];
```

Each workflow directory must contain:

- `workflow.json` - n8n workflow export
- `metadata.json` - Structured metadata
- `README.md` - Technical documentation

### n8n Workflow Validation

```javascript
// Basic n8n workflow structure
if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
  results.errors.push("workflow.json must contain a nodes array");
}

if (!workflow.connections) {
  results.warnings.push("workflow.json should contain connections object");
}
```

**Required Structure**:

- `nodes` array - Workflow node definitions
- `connections` object - Node connection mapping (recommended)

### Metadata Validation

```javascript
const requiredFields = ["name", "description", "version", "category"];
const missingFields = requiredFields.filter((field) => !metadata[field]);
```

**Required Fields**:

- `name` - Workflow name
- `description` - Purpose description
- `version` - Semantic version
- `category` - Workflow category

**Version Validation**:

```javascript
if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
  results.warnings.push("Version should follow semantic versioning (x.y.z)");
}
```

### README Documentation Standards

```javascript
const requiredSections = [
  "# ", // Title
  "## Overview",
  "## Technical Specification",
  "### Input Requirements",
  "### Processing Logic",
  "### Output Specification",
];
```

**Validation Process**:

1. Reads README.md content
2. Searches for required section headers
3. Reports missing sections as warnings
4. Maintains documentation consistency

## CLI Interface

### Command Line Usage

```bash
# Validate all workflows (default)
node scripts/validate-workflow.js

# Check for duplicate names and consistency
node scripts/validate-workflow.js --check-consistency

# Validate with README completeness (included in main validation)
node scripts/validate-workflow.js --check-readme
```

### npm Script Integration

```json
{
  "scripts": {
    "validate-all-workflows": "node scripts/validate-workflow.js",
    "check-metadata-consistency": "node scripts/validate-workflow.js --check-consistency",
    "validate-readme-completeness": "node scripts/validate-workflow.js --check-readme",
    "test": "pnpm validate-all-workflows"
  }
}
```

### Exit Codes

- **0** - All validations passed
- **1** - Validation failures detected

## Error Handling

### Error Categories

**Critical Errors** (validation failure):

- Missing required files
- Invalid JSON syntax
- Schema validation failures
- Missing required metadata fields

**Warnings** (validation passes):

- Missing recommended sections
- Version format recommendations
- Best practice suggestions

### Error Reporting Format

```javascript
// Error example
results.errors.push(`Missing required files: ${missingFiles.join(", ")}`);

// Warning example
results.warnings.push("Version should follow semantic versioning (x.y.z)");
```

**Console Output**:

```
Validating workflow: csv-transformer
  ❌ Errors:
    - Missing required files: metadata.json
  ⚠️  Warnings:
    - Version should follow semantic versioning (x.y.z)
```

## Schema Integration

### AJV Configuration

```javascript
this.ajv = new Ajv({ allErrors: true, strict: false });
addFormats(this.ajv);
```

**Features**:

- **All Errors** - Reports all validation errors, not just first
- **Format Support** - Date, URI, email validation
- **Strict Mode** - Disabled for flexibility with additional properties

### Schema Validation Process

```javascript
if (this.metadataSchema && !this.ajv.validate(this.metadataSchema, metadata)) {
  results.errors.push(
    `Metadata schema validation failed: ${this.ajv.errorsText()}`,
  );
  results.valid = false;
}
```

**Error Messages**:
AJV provides detailed error descriptions:

- Property missing: `should have required property 'name'`
- Type mismatch: `should be string`
- Pattern mismatch: `should match pattern "^\\d+\\.\\d+\\.\\d+$"`

## Extension Points

### Custom Validation Rules

Add custom validation by extending the `validateWorkflowFolder` method:

```javascript
// Add custom metadata field validation
if (metadata.custom_field && !isValidCustomField(metadata.custom_field)) {
  results.warnings.push("Custom field format recommendation");
}
```

### Additional Schema Support

Load additional schemas in constructor:

```javascript
this.customSchema = this.loadSchema("./schemas/custom.schema.json");
```

### Category-Specific Validation

```javascript
// Add category-specific rules
if (metadata.category === "data-processing") {
  // Data processing specific validation
  if (!metadata.requirements?.nodes?.includes("Code")) {
    results.warnings.push("Data processing workflows typically use Code nodes");
  }
}
```

## Performance Characteristics

### Validation Speed

- **Single Workflow**: <100ms average
- **All Workflows** (3): <500ms total
- **Schema Loading**: One-time cost ~50ms

### Memory Usage

- **Base Process**: ~15MB
- **Per Workflow**: ~1-2MB additional
- **Schema Cache**: Persistent across validations

### Scalability

- Linear scaling with workflow count
- Efficient directory traversal
- Minimal memory footprint per workflow

## CI/CD Integration

### GitHub Actions Usage

```yaml
- name: Validate Workflows
  run: pnpm validate-all-workflows

- name: Check Consistency
  run: pnpm check-metadata-consistency
```

### Pre-commit Hooks

```bash
#!/bin/sh
pnpm validate-all-workflows || exit 1
pnpm check-metadata-consistency || exit 1
```

### Quality Gates

1. All validations must pass (exit code 0)
2. No critical errors allowed in production
3. Warnings logged but don't block deployment
4. Consistency checks prevent duplicate workflows

---

_API reference generated on: 2024-09-01_  
_For the latest validation code, see [scripts/validate-workflow.js](../scripts/validate-workflow.js)_
