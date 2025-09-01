# Pull Request: n8n Workflow Changes

## 📋 Summary
<!-- Provide a brief description of the changes in this PR -->

## 🔄 Type of Change
<!-- Mark the relevant option with [x] -->
- [ ] New workflow addition
- [ ] Existing workflow modification
- [ ] Workflow deletion/archival
- [ ] Documentation update
- [ ] Repository structure change
- [ ] Validation/tooling improvement

## 📁 Workflows Affected
<!-- List the workflows that are being added, modified, or removed -->
- Category: `category-name`
- Workflow: `workflow-folder-name`
- Action: Added/Modified/Removed

## ✅ Validation Checklist
<!-- Ensure all items are checked before requesting review -->

### Required Files
- [ ] `workflow.json` - n8n workflow export included
- [ ] `metadata.json` - workflow metadata complete and valid
- [ ] `README.md` - technical specification documented

### Validation Results  
- [ ] `npm run validate-all-workflows` passes
- [ ] `npm run check-metadata-consistency` passes  
- [ ] `npm run validate-readme-completeness` passes
- [ ] No secrets or credentials exposed in files

### Documentation Quality
- [ ] README includes all required sections:
  - [ ] Overview
  - [ ] Technical Specification  
  - [ ] Input Requirements
  - [ ] Processing Logic
  - [ ] Output Specification
  - [ ] Dependencies
  - [ ] Configuration
  - [ ] Performance Characteristics
  - [ ] Testing
  - [ ] Foundation Model Context
- [ ] Metadata includes appropriate tags and categorization
- [ ] All dependencies and requirements clearly documented

## 🧪 Testing
<!-- Describe how the workflow has been tested -->

### Test Environment
- [ ] n8n Version: `x.x.x`
- [ ] Test Method: Local/Cloud/Staging
- [ ] Test Data: Sample/Production-like/Synthetic

### Test Results
- [ ] Workflow executes successfully
- [ ] Expected outputs generated
- [ ] Error handling tested
- [ ] Performance within acceptable bounds

### Test Evidence
<!-- Provide screenshots, logs, or other evidence of successful testing -->

## 🔧 Configuration Notes
<!-- Any special configuration requirements or setup notes -->

### Required Credentials
<!-- List any n8n credentials that need to be configured -->
- [ ] Credential Type 1: Description
- [ ] Credential Type 2: Description

### Environment Variables
<!-- List any environment variables that need to be set -->
- [ ] `VARIABLE_NAME`: Purpose and example value

### External Dependencies
<!-- List any external services or APIs -->
- [ ] Service 1: Purpose and configuration notes
- [ ] Service 2: Purpose and configuration notes

## 🚨 Breaking Changes
<!-- Mark if this introduces any breaking changes -->
- [ ] No breaking changes
- [ ] Breaking changes (describe below)

<!-- If breaking changes, describe the impact and migration path -->

## 📚 Additional Context
<!-- Add any other context about the pull request here -->

### Business Context
<!-- Why is this change needed? What problem does it solve? -->

### Technical Context  
<!-- Any technical considerations, limitations, or design decisions -->

### Future Considerations
<!-- Any planned follow-up work or known limitations -->

## 👀 Review Focus Areas
<!-- Highlight specific areas where you want focused review -->
- [ ] Workflow logic and structure
- [ ] Security and credential handling
- [ ] Performance and resource usage
- [ ] Documentation completeness
- [ ] Error handling robustness

---

## 🤖 Automated Checks
<!-- This section will be populated by GitHub Actions -->

The following automated validations will run when this PR is submitted:
- ✅ Workflow structure validation
- ✅ Metadata schema compliance
- ✅ README completeness check
- ✅ Security scan for exposed secrets
- ✅ Documentation standards verification

## 📖 Reviewer Guidelines

### For New Workflows
1. Verify business justification and documentation quality
2. Test workflow execution with provided test data
3. Validate security practices and credential handling
4. Check performance characteristics and resource usage
5. Ensure proper categorization and metadata

### For Workflow Modifications
1. Understand the change rationale and impact
2. Verify backward compatibility or document breaking changes
3. Test both old and new functionality if applicable
4. Validate that version numbers are updated appropriately
5. Check that documentation reflects the changes

### For Repository Structure Changes
1. Ensure changes align with established patterns
2. Validate that automation and tooling still function
3. Check for impacts on existing workflows
4. Verify documentation updates reflect structural changes