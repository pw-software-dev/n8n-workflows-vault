# n8n Workflows Repository

> **A structured, validated repository for managing n8n workflows with comprehensive automation and foundation model integration**

[![Validate Workflows](https://github.com/your-org/n8n-workflows/actions/workflows/validate-workflows.yml/badge.svg)](https://github.com/your-org/n8n-workflows/actions/workflows/validate-workflows.yml)
[![Generate Documentation](https://github.com/your-org/n8n-workflows/actions/workflows/generate-docs.yml/badge.svg)](https://github.com/your-org/n8n-workflows/actions/workflows/generate-docs.yml)

## 📊 Current Statistics

- **Total Workflows**: 5
- **Categories**: 4 (data-processing, notifications, integrations, productivity)
- **Last Updated**: 2025-09-02
- **Repository Health**: ✅ All workflows validated

## 🏗️ Repository Structure

```
n8n-workflows/
├── README.md                    # This file
├── package.json                 # Dependencies and scripts
├── .github/
│   ├── workflows/
│   │   ├── validate-workflows.yml    # CI/CD validation pipeline
│   │   └── generate-docs.yml         # Documentation automation
│   └── PULL_REQUEST_TEMPLATE.md      # PR template with validation checklist
├── scripts/
│   ├── validate-workflow.js          # Workflow validation script
│   ├── generate-readme.js            # README generation automation
│   └── migrate-workflow.js           # Version migration tools
├── schemas/
│   ├── workflow.schema.json          # n8n workflow JSON schema
│   └── metadata.schema.json          # Workflow metadata validation schema
├── templates/
│   └── workflow-readme.md            # Standardized README template
└── workflows/
    ├── data-processing/              # Data transformation workflows
    │   └── csv-transformer/
    │       ├── workflow.json         # n8n workflow definition
    │       ├── metadata.json         # Workflow metadata
    │       └── README.md             # Technical specification
    ├── notifications/                # Alert and notification workflows
    │   └── slack-alerts/
    │       ├── workflow.json
    │       ├── metadata.json
    │       └── README.md
    ├── integrations/                 # System integration workflows
    │   ├── crm-sync/
    │   │   ├── workflow.json
    │   │   ├── metadata.json
    │   │   └── README.md
    │   ├── print-do-date-tomorrow/
    │   │   ├── workflow.json
    │   │   ├── metadata.json
    │   │   └── README.md
    │   └── screenshot-and-print/
    │       ├── workflow.json
    │       ├── metadata.json
    │       └── README.md
    └── productivity/                  # Productivity and automation workflows
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- n8n instance (local or cloud)
- Git for version control

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/n8n-workflows.git
cd n8n-workflows

# Install dependencies
pnpm install

# Validate all workflows
pnpm validate-all-workflows

# Generate documentation (optional)
pnpm generate-readme
```

### Adding Your First Workflow

1. **Choose or create a category**

   ```bash
   mkdir -p workflows/your-category/your-workflow-name
   cd workflows/your-category/your-workflow-name
   ```

2. **Export workflow from n8n**

   - In n8n: Settings → Import/Export → Export Workflow
   - Save as `workflow.json`

3. **Create metadata**

   ```bash
   # Copy and customize the metadata template
   cat > metadata.json << 'EOF'
   {
     "name": "Your Workflow Name",
     "description": "Brief description of what this workflow does",
     "version": "1.0.0",
     "category": "your-category",
     "tags": ["tag1", "tag2"],
     "author": "your-team",
     "created": "2024-08-30",
     "updated": "2024-08-30",
     "n8n_version": "1.45.0",
     "requirements": {
       "credentials": [],
       "nodes": ["node1", "node2"],
       "environment_variables": []
     },
     "triggers": ["webhook"],
     "complexity": "medium",
     "execution_time": "30-60 seconds",
     "resources": {
       "memory": "low",
       "cpu": "medium",
       "storage": "minimal"
     }
   }
   EOF
   ```

4. **Generate README**

   ```bash
   # Auto-generate README from template
   pnpm generate-readme workflows/your-category/your-workflow-name
   ```

5. **Validate and commit**

   ```bash
   # Validate your workflow
   pnpm test

   # Commit if validation passes
   git add .
   git commit -m "feat: add your-workflow-name workflow"
   git push
   ```

## 📋 Categories

### 🔄 Data Processing

Workflows focused on data transformation, validation, and processing.

- **csv-transformer** - Transforms CSV data to structured JSON format

### 🔔 Notifications

Alert and notification systems for monitoring and communication.

- **slack-alerts** - Intelligent Slack alerting with severity-based routing

### 🔗 Integrations

System integration workflows for connecting different services.

- **crm-sync** - Bidirectional CRM data synchronization
- **print-do-date-tomorrow** - Automatically prints task receipts for Notion tasks scheduled for tomorrow
- **screenshot-and-print** - Captures screenshots of HTML content and sends to printer

### 📈 Productivity

Automation workflows for productivity and task management.

_(Category ready for workflows)_

## 🛠️ Available Scripts

| Script                         | Description                               | Usage                               |
| ------------------------------ | ----------------------------------------- | ----------------------------------- |
| `validate-all-workflows`       | Validate all workflows against schemas    | `pnpm validate-all-workflows`       |
| `check-metadata-consistency`   | Check for duplicate names and consistency | `pnpm check-metadata-consistency`   |
| `validate-readme-completeness` | Verify README completeness                | `pnpm validate-readme-completeness` |
| `generate-readme`              | Auto-generate README files                | `pnpm generate-readme [path]`       |
| `migrate-workflow`             | Migrate workflows to newer versions       | `pnpm migrate-workflow [path]`      |
| `test`                         | Run all validation checks                 | `pnpm test`                         |

## ⚙️ Validation Framework

### Automated Quality Gates

Every workflow is validated against:

- ✅ **Structure Validation** - n8n workflow format compliance
- ✅ **Metadata Schema** - Required fields and format validation
- ✅ **Documentation Standards** - README completeness and structure
- ✅ **Security Scanning** - No exposed secrets or credentials
- ✅ **Naming Conventions** - Consistent file and folder naming

### CI/CD Pipeline

- **Pre-commit validation** on all pull requests
- **Automated documentation generation** weekly
- **Security scanning** for exposed credentials
- **Cross-platform compatibility** testing (Node 18+, 20+)

## 📖 Documentation Standards

### Required Files per Workflow

1. **workflow.json** - n8n workflow export
2. **metadata.json** - Structured workflow information
3. **README.md** - Technical specification and documentation

### README Template Sections

- **Overview** - Purpose and business context
- **Technical Specification** - Detailed technical requirements
- **Input/Output Specifications** - Data structure definitions
- **Configuration** - Setup and deployment instructions
- **Testing** - Validation steps and test data
- **Foundation Model Context** - AI-optimized structured information

## 🤖 Foundation Model Integration

### AI-Optimized Documentation

Each workflow README includes a **Foundation Model Context** section with:

- **Intent** - Primary business goal and purpose
- **Input Schema** - Structured data format definitions
- **Business Rules** - Key logic and constraints
- **Error Scenarios** - Common failure modes and handling
- **Success Criteria** - Measurable outcomes and validation

### Structured Metadata

Comprehensive metadata enables:

- Automated workflow discovery and categorization
- Intelligent dependency mapping
- Performance and resource planning
- Compliance and security assessment

## 🔒 Security & Compliance

### Security Best Practices

- **No hardcoded credentials** - All secrets managed via n8n credentials
- **Automated security scanning** - CI/CD pipeline checks for exposed secrets
- **Access control documentation** - Required permissions clearly specified
- **Data sensitivity classification** - Confidential data handling procedures

### Compliance Features

- **GDPR compliance support** - Data handling and retention policies
- **Audit trail** - Complete version history and change tracking
- **Security review requirements** - Mandatory reviews for sensitive workflows
- **Documentation standards** - Consistent security documentation

## 🔧 Advanced Features

### Version Migration

```bash
# Migrate specific workflow to version 2.0.0
pnpm migrate-workflow workflows/category/workflow-name --target 2.0.0

# Migrate all workflows to latest version
pnpm migrate-workflow

# List available migration versions
pnpm migrate-workflow --list-versions
```

### Batch Operations

```bash
# Validate specific category
pnpm validate-all-workflows -- --category data-processing

# Generate READMEs for specific workflow
pnpm generate-readme workflows/notifications/slack-alerts

# Check consistency across all workflows
pnpm check-metadata-consistency
```

### Custom Validation Rules

Extend validation by modifying `scripts/validate-workflow.js`:

- Add custom metadata fields
- Implement business-specific validation rules
- Create organization-specific quality gates

## 🤝 Contributing

### Workflow Contribution Process

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/new-workflow`)
3. **Add** your workflow following the structure guidelines
4. **Validate** using `pnpm test`
5. **Submit** pull request with completed template

### Pull Request Checklist

- [ ] All validation scripts pass
- [ ] README includes all required sections
- [ ] Metadata is complete and valid
- [ ] No secrets or credentials exposed
- [ ] Test data and validation steps provided

### Code Review Guidelines

- **Functionality** - Does the workflow solve the stated problem?
- **Security** - Are credentials properly handled?
- **Documentation** - Is technical documentation complete?
- **Performance** - Are resource usage patterns reasonable?
- **Maintainability** - Can the workflow be easily understood and modified?

## 📚 Resources

### Documentation

- [n8n Official Documentation](https://docs.n8n.io/)
- [n8n Node Reference](https://docs.n8n.io/nodes/)
- [Workflow Best Practices](https://docs.n8n.io/workflows/)

### Community

- [n8n Community Forum](https://community.n8n.io/)
- [n8n Discord Server](https://discord.gg/n8n)
- [GitHub Issues](https://github.com/your-org/n8n-workflows/issues)

### Support

- **Repository Issues** - Technical problems and feature requests
- **Team Slack** - `#n8n-workflows` channel
- **Documentation** - Wiki and internal documentation

## 📈 Monitoring & Analytics

### Workflow Health Metrics

- **Execution Success Rate** - Target: >95%
- **Average Execution Time** - Monitored per workflow
- **Error Rate Trends** - Weekly and monthly analysis
- **Resource Utilization** - Memory, CPU, and network usage

### Repository Health

- **Validation Pass Rate** - CI/CD pipeline success rate
- **Documentation Coverage** - Percentage of complete documentation
- **Security Compliance** - Clean security scan results
- **Contributor Activity** - PR submission and review metrics

## 🚨 Troubleshooting

### Common Issues

| Issue                   | Cause                            | Solution                                       |
| ----------------------- | -------------------------------- | ---------------------------------------------- |
| Validation fails        | Missing required metadata fields | Check metadata.schema.json for required fields |
| README generation fails | Invalid workflow.json format     | Validate JSON syntax and n8n export format     |
| CI/CD pipeline fails    | Schema validation errors         | Run local validation and fix errors            |
| Security scan alerts    | Exposed credentials in files     | Review files for hardcoded secrets             |

### Getting Help

1. **Check existing issues** - Search GitHub issues for similar problems
2. **Review validation logs** - Check CI/CD pipeline logs for specific errors
3. **Consult documentation** - Review schema definitions and examples
4. **Contact team** - Reach out via Slack or create GitHub issue

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **n8n Community** - For the excellent automation platform
- **Contributors** - All team members who contribute workflows and improvements
- **Foundation Models** - For enabling intelligent workflow management and documentation

---

_Last updated: 2025-09-02 | Repository maintained by Integration Team_
