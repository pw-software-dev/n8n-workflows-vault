# Backup Workflows to GitHub

> **Version**: 1.0.0 | **Category**: automation | **Author**: n8n-automation-team  
> **Created**: 2024-12-28 | **Updated**: 2024-12-28

## Overview

Automated daily backup of all n8n workflows to a GitHub repository with version control and change tracking.

**Tags**: backup, github, automation, workflow-management, version-control, scheduled  
**Complexity**: high  
**Estimated Runtime**: 5-15 minutes  
**Compatible n8n Version**: 1.71.0

## Technical Specification

### Input Requirements

- **Trigger Type**: **n8n-nodes-base.scheduleTrigger**
- **Schedule**: Daily at 2:00 AM UTC (configurable via cron expression)
- **Required Credentials**: n8n API credentials, GitHub API credentials
- **Environment Variables**: GITHUB_OWNER, GITHUB_REPO

### Processing Logic

1. **Daily Backup Schedule** (n8n-nodes-base.scheduleTrigger) - Triggers the backup process daily
2. **Get All Workflows** (n8n-nodes-base.n8n) - Retrieves list of all workflows from n8n
3. **Split Workflows** (n8n-nodes-base.splitInBatches) - Processes workflows individually
4. **Get Workflow Details** (n8n-nodes-base.n8n) - Fetches complete workflow data
5. **Prepare Workflow Data** (n8n-nodes-base.code) - Sanitizes and formats workflow data
6. **Backup to GitHub** (n8n-nodes-base.github) - Creates or updates workflow files in GitHub
7. **Update GitHub File** (n8n-nodes-base.github) - Updates existing files when needed
8. **Check Backup Success** (n8n-nodes-base.if) - Validates successful backup operations
9. **Create Backup Summary** (n8n-nodes-base.code) - Generates execution summary

### Output Specification

- **Output Format**: JSON summary
- **Success Response**:

  ```json
  {
    "timestamp": "2024-12-28T02:00:00.000Z",
    "totalWorkflows": 25,
    "successfulBackups": 25,
    "failedBackups": 0,
    "status": "success"
  }
  ```

- **Partial Success Response**:
  ```json
  {
    "timestamp": "2024-12-28T02:00:00.000Z",
    "totalWorkflows": 25,
    "successfulBackups": 23,
    "failedBackups": 2,
    "status": "partial_success"
  }
  ```

### Dependencies

**Credentials**: n8nApi, githubApi

**Nodes**: n8n-nodes-base.scheduleTrigger, n8n-nodes-base.n8n, n8n-nodes-base.splitInBatches, n8n-nodes-base.code, n8n-nodes-base.github, n8n-nodes-base.if

**External Services**: GitHub API, n8n API

### Configuration

#### GitHub Repository Setup

- **Repository**: Configure via `GITHUB_REPO` environment variable
- **Owner**: Configure via `GITHUB_OWNER` environment variable
- **Access Token**: GitHub Personal Access Token with repo permissions
- **File Structure**: `workflows/{sanitized-workflow-name}.json`

#### Schedule Settings

- **Cron Expression**: `0 2 * * *` (daily at 2:00 AM UTC)
- **Timezone**: UTC
- **Batch Size**: Processes workflows individually to avoid memory issues

#### Timeout Settings

- **Execution Timeout**: 30 minutes
- **Individual Node Timeout**: 5 minutes
- **GitHub API Timeout**: 60 seconds

### Performance Characteristics

- **Expected Runtime**: 5-15 minutes (depends on workflow count)
- **Resource Usage**:
  - Memory: Medium (handles workflow data in batches)
  - CPU: Medium (JSON processing and API calls)
  - Network: High (multiple API requests to n8n and GitHub)
- **Scalability**: Designed for up to 1000 workflows
- **Rate Limits**: Respects GitHub API rate limits (5000 requests/hour)

### Error Handling

#### Common Error Scenarios

1. **n8n API Authentication Failure**

   - Cause: Invalid or expired n8n API credentials
   - Resolution: Update n8n API credentials
   - Recovery: Manual retry after credential fix

2. **GitHub API Authentication Failure**

   - Cause: Invalid or expired GitHub token
   - Resolution: Generate new GitHub Personal Access Token
   - Recovery: Update credentials and retry

3. **Large Workflow Upload Failure**

   - Cause: Workflow exceeds GitHub file size limits (>10MB)
   - Resolution: Optimize workflow or split into smaller components
   - Recovery: Manual review and optimization required

4. **Rate Limit Exceeded**
   - Cause: Too many GitHub API requests in short timeframe
   - Resolution: Workflow includes automatic retry logic
   - Recovery: Automatic retry with exponential backoff

#### Error Notifications

- **Console Logging**: Detailed error information in n8n execution logs
- **Backup Summary**: Status tracking for successful vs failed backups
- **Workflow State**: Failed executions visible in n8n workflow history

### Testing

#### Prerequisites

1. Valid n8n API credentials configured
2. GitHub repository with write access
3. GitHub Personal Access Token with repo permissions
4. Environment variables set correctly

#### Test Data

```bash
# Environment Variables
GITHUB_OWNER=your-github-username
GITHUB_REPO=n8n-workflow-backups

# Test with single workflow first
# Activate workflow and trigger manually
# Check GitHub repository for created files
```

#### Validation Steps

1. **Credential Validation**: Verify n8n and GitHub API access
2. **Workflow Retrieval**: Confirm all workflows are fetched correctly
3. **File Creation**: Check GitHub repository for backup files
4. **Content Integrity**: Validate backed up workflow matches original
5. **Error Handling**: Test with invalid credentials to verify error handling
6. **Schedule Execution**: Verify automated daily execution

#### Monitoring

- **Key Metrics**:
  - Backup success rate: > 95%
  - Average execution time: < 15 minutes
  - GitHub API error rate: < 2%
- **Alerts**: Monitor for consecutive backup failures
- **Logs**: Review execution logs for API errors or timeouts

### Security Considerations

#### Data Handling

- **Sensitive Data**: Workflow configurations may contain sensitive information
- **Data Retention**: GitHub repository serves as long-term backup storage
- **Encryption**: Data encrypted in transit via HTTPS APIs

#### Access Control

- **n8n API**: Requires admin-level access to read all workflows
- **GitHub API**: Requires repository write permissions
- **Credential Management**: Store credentials securely in n8n credential store

#### Best Practices

- **Token Security**: Use dedicated GitHub token with minimal required permissions
- **Repository Privacy**: Consider using private repository for sensitive workflows
- **Access Logging**: Monitor GitHub repository access patterns

### Deployment

#### Prerequisites

1. n8n version 1.71.0 or higher
2. Valid n8n API credentials with admin access
3. GitHub repository for backups
4. GitHub Personal Access Token configured
5. Environment variables configured

#### Installation Steps

1. Import `workflow.json` into n8n
2. Configure n8n API credentials
3. Configure GitHub API credentials with Personal Access Token
4. Set environment variables (GITHUB_OWNER, GITHUB_REPO)
5. Test with manual execution
6. Activate workflow for scheduled execution

#### Environment Variables

```bash
# GitHub repository configuration
GITHUB_OWNER=your-github-username
GITHUB_REPO=n8n-workflow-backups

# Optional: Custom backup schedule
BACKUP_CRON_SCHEDULE=0 2 * * *
```

### Maintenance

#### Regular Tasks

- **Weekly**: Review backup success rate and execution times
- **Monthly**: Validate GitHub repository integrity and file counts
- **Quarterly**: Review and update GitHub access token if needed
- **Annually**: Audit backup repository for cleanup opportunities

#### Version Updates

- **n8n Compatibility**: Test workflow with new n8n versions
- **GitHub API Changes**: Monitor GitHub API versioning and deprecations
- **Token Renewal**: GitHub tokens may require periodic renewal

### Troubleshooting

#### Common Issues

| Issue                        | Symptoms                               | Solution                                       |
| ---------------------------- | -------------------------------------- | ---------------------------------------------- |
| No workflows backed up       | Empty execution with no files created  | Check n8n API credentials and permissions      |
| GitHub authentication errors | 401/403 errors from GitHub API         | Verify GitHub token validity and permissions   |
| Partial backup failures      | Some workflows missing from repository | Review failed workflow sizes and names         |
| Execution timeouts           | Workflow stops mid-execution           | Reduce batch size or increase timeout settings |

#### Debugging Steps

1. **Check Credentials**: Verify both n8n and GitHub credentials are valid
2. **Test API Access**: Manually test n8n and GitHub API endpoints
3. **Review Logs**: Check n8n execution logs for detailed error messages
4. **Validate Environment**: Confirm environment variables are set correctly
5. **GitHub Repository**: Verify repository exists and is accessible

#### Support Contacts

- **Primary**: n8n-automation-team@company.com
- **Secondary**: GitHub Repository Administrator
- **Escalation**: Platform Team Lead

---

## Foundation Model Context

This section provides structured information for AI/foundation models to understand and work with this workflow.

### Intent

**Primary Goal**: Automatically backup all n8n workflows to a GitHub repository on a daily schedule, providing version control and disaster recovery capabilities.

**Business Value**:

- Ensures workflow preservation and version control
- Enables disaster recovery and workflow restoration
- Provides audit trail for workflow changes
- Facilitates collaboration and workflow sharing

**Use Cases**:

- Daily automated backups of production n8n workflows
- Version control for workflow development lifecycle
- Disaster recovery and business continuity planning
- Workflow migration between n8n instances

### Input Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "schedule": {
      "type": "string",
      "description": "Cron expression for backup schedule",
      "default": "0 2 * * *"
    },
    "github_owner": {
      "type": "string",
      "description": "GitHub username or organization"
    },
    "github_repo": {
      "type": "string",
      "description": "GitHub repository for backups"
    }
  },
  "required": ["github_owner", "github_repo"]
}
```

### Business Rules

1. **Complete Coverage**: All workflows (active and inactive) are backed up
2. **File Naming**: Workflow names are sanitized for filesystem compatibility
3. **Version Control**: Each backup creates a new commit with descriptive message
4. **Error Resilience**: Individual workflow failures don't stop the entire backup process
5. **Resource Management**: Workflows processed individually to prevent memory issues

### Error Scenarios

- **Authentication Failures**: Invalid n8n or GitHub credentials
- **Network Issues**: API timeouts or connectivity problems
- **Resource Constraints**: Large workflows exceeding GitHub file limits
- **Rate Limiting**: GitHub API request limits exceeded
- **Repository Issues**: GitHub repository access or permission problems

### Success Criteria

- **Functional**: All accessible workflows successfully backed up to GitHub
- **Performance**: Backup process completes within 30 minutes
- **Quality**: Backed up workflows maintain complete fidelity to originals
- **Reliability**: >95% success rate over time with automatic error handling

### Integration Points

- **Upstream Systems**: n8n instance and workflow database
- **Downstream Systems**: GitHub repository and version control system
- **External APIs**: n8n API for workflow retrieval, GitHub API for file operations
- **Internal Services**: n8n credential management and execution engine

---

## Changelog

### Version 1.0.0

- **Date**: 2024-12-28
- **Changes**:
  - Initial release with complete backup functionality
  - Daily scheduled execution at 2:00 AM UTC
  - Comprehensive error handling and logging
  - Workflow name sanitization for file system compatibility
  - Automatic file creation and updates in GitHub
  - Backup summary generation and status reporting
- **Breaking Changes**: None

---

_This documentation was generated from workflow metadata. Last updated: 2024-12-28_
