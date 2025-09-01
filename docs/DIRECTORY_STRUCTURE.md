# Directory Structure Reference

> **Complete project layout and organization guide**

## Project Root Structure

```
n8n-workflows/                          # Root directory
├── 📁 docs/                            # Generated documentation
│   ├── PROJECT_INDEX.md                # Main navigation index
│   ├── METADATA_SCHEMA.md              # Schema documentation
│   ├── VALIDATION_API.md               # API reference
│   ├── DIRECTORY_STRUCTURE.md          # This file
│   └── COMPONENT_ARCHITECTURE.md       # System overview
├── 📁 schemas/                         # JSON Schema definitions
│   ├── metadata.schema.json            # Workflow metadata validation
│   └── workflow.schema.json            # n8n workflow validation
├── 📁 scripts/                         # Automation & validation tools
│   ├── validate-workflow.js            # Main validation engine
│   ├── generate-readme.js              # Documentation generation
│   └── migrate-workflow.js             # Version migration utility
├── 📁 templates/                       # Standardized templates
│   └── workflow-readme.md              # README template (269 lines)
├── 📁 workflows/                       # Workflow library
│   ├── 📁 data-processing/             # Data transformation category
│   ├── 📁 notifications/               # Alert & notification category
│   └── 📁 integrations/                # System integration category
├── 📁 .github/                         # GitHub configuration
│   ├── 📁 workflows/                   # CI/CD automation
│   │   ├── validate-workflows.yml      # Automated validation
│   │   └── generate-docs.yml           # Documentation automation
│   └── PULL_REQUEST_TEMPLATE.md        # PR submission guidelines
├── 📁 .claude/                         # Claude Code configuration
├── 📁 node_modules/                    # Dependencies (ignored)
├── 📄 package.json                     # Project configuration
├── 📄 package-lock.json                # Dependency lock file
├── 📄 README.md                        # Project overview (337 lines)
└── 📄 .gitignore                       # Version control exclusions
```

## Workflow Organization

Each workflow follows a standardized directory structure:

```
workflows/{category}/{workflow-name}/
├── workflow.json                       # n8n workflow export (required)
├── metadata.json                       # Structured workflow metadata (required)
└── README.md                          # Technical documentation (required)
```

### Current Workflow Structure

#### Data Processing Category
```
workflows/data-processing/
└── csv-transformer/
    ├── workflow.json                   # CSV transformation workflow
    ├── metadata.json                   # Version 1.2.0 metadata
    └── README.md                       # 269 lines documentation
```

#### Notifications Category
```
workflows/notifications/
└── slack-alerts/
    ├── workflow.json                   # Slack alerting workflow
    ├── metadata.json                   # Version 1.1.0 metadata  
    └── README.md                       # 270 lines documentation
```

#### Integrations Category
```
workflows/integrations/
└── crm-sync/
    ├── workflow.json                   # CRM synchronization workflow
    ├── metadata.json                   # Version 2.1.0 metadata
    └── README.md                       # 271 lines documentation
```

## File Type Breakdown

### Configuration Files

| File | Purpose | Size | Location |
|------|---------|------|----------|
| `package.json` | Project dependencies & scripts | 847B | Root |
| `package-lock.json` | Dependency version lock | 133KB | Root |
| `.gitignore` | Version control exclusions | 80 lines | Root |

### Schema Definitions

| File | Purpose | Lines | Validation Rules |
|------|---------|-------|------------------|
| `metadata.schema.json` | Metadata structure validation | 320 | 35+ fields, complex validation |
| `workflow.schema.json` | n8n workflow format validation | TBD | n8n structure compliance |

### Automation Scripts

| Script | Purpose | Lines | Dependencies |
|--------|---------|-------|--------------|
| `validate-workflow.js` | Schema validation engine | 273 | AJV, ajv-formats |
| `generate-readme.js` | Documentation automation | 181 | Node.js fs, path |
| `migrate-workflow.js` | Version migration utility | TBD | Migration logic |

### Documentation Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `README.md` | Project overview | 337 | Setup, usage, guidelines |
| `PULL_REQUEST_TEMPLATE.md` | PR template | 143 | Contribution guidelines |
| `workflow-readme.md` | Template | 269 | Workflow documentation standard |
| Workflow READMEs | Documentation | ~270 each | Technical specifications |

## Directory Naming Conventions

### Categories (Kebab-Case)
- `data-processing` - Data transformation workflows
- `notifications` - Alert and notification systems
- `integrations` - System integration workflows
- `automation` - General automation tasks
- `reporting` - Report generation workflows  
- `monitoring` - System monitoring workflows

### Workflows (Kebab-Case)
- `csv-transformer` - Descriptive, action-oriented
- `slack-alerts` - Service and function combined
- `crm-sync` - Abbreviated but clear

### Files (Standard Extensions)
- `.json` - JSON configuration and data files
- `.js` - JavaScript automation scripts
- `.md` - Markdown documentation files
- `.yml` - YAML CI/CD configuration files

## Access Patterns

### Development Workflow
1. **Browse by category**: `/workflows/{category}/`
2. **Select workflow**: `/workflows/{category}/{workflow-name}/`
3. **Review documentation**: `README.md` first
4. **Check metadata**: `metadata.json` for requirements
5. **Import workflow**: `workflow.json` into n8n

### Validation Workflow  
1. **Run validation**: `npm run validate-all-workflows`
2. **Check results**: Console output and exit codes
3. **Fix issues**: Based on validation error messages
4. **Re-validate**: Until all workflows pass

### Documentation Workflow
1. **Update metadata**: Modify `metadata.json`
2. **Generate README**: `npm run generate-readme [path]`
3. **Review output**: Check generated documentation
4. **Commit changes**: Include both metadata and README

## File Size Analysis

### Size Distribution
- **Small files** (<1KB): Configuration snippets, simple metadata
- **Medium files** (1-100KB): Workflow JSON exports, detailed metadata
- **Large files** (>100KB): package-lock.json, comprehensive documentation

### Growth Patterns
- **Linear with workflows**: Each new workflow adds ~270 lines documentation
- **Schema complexity**: Metadata schema grows with new validation requirements
- **Documentation scaling**: Project docs grow with features and complexity

## Security Considerations

### Sensitive File Locations
- **Credentials**: Never stored in repository
- **Environment variables**: Listed in metadata, values external
- **API keys**: Referenced but not included
- **Private configurations**: Excluded via `.gitignore`

### Access Control
- **Public repository**: All documentation and schemas visible
- **Internal references**: Links to internal systems in metadata
- **CI/CD secrets**: Managed through GitHub Actions secrets

## Maintenance Guidelines

### Regular Cleanup
- **node_modules/**: Regenerated from package-lock.json
- **Temporary files**: Excluded via .gitignore
- **Generated docs**: Updated via automation scripts
- **Version artifacts**: Managed through proper git practices

### Directory Health Checks
1. **Required files present**: All workflows have JSON, metadata, README
2. **Naming consistency**: Kebab-case for categories and workflows
3. **Documentation completeness**: All required README sections
4. **Schema compliance**: All metadata validates against schema

---

*Directory structure reference generated on: 2024-09-01*  
*File counts and sizes are current as of generation time*