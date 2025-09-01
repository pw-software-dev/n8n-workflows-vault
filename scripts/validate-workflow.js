#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class WorkflowValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    
    // Load schemas if they exist
    this.workflowSchema = this.loadSchema('./schemas/workflow.schema.json');
    this.metadataSchema = this.loadSchema('./schemas/metadata.schema.json');
    
    this.errors = [];
    this.warnings = [];
  }

  loadSchema(schemaPath) {
    try {
      if (fs.existsSync(schemaPath)) {
        return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
    } catch (error) {
      console.warn(`Warning: Could not load schema ${schemaPath}`);
    }
    return null;
  }

  validateWorkflowFolder(folderPath) {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    const folderName = path.basename(folderPath);
    console.log(`\nValidating workflow: ${folderName}`);

    // Check required files exist
    const requiredFiles = ['workflow.json', 'README.md', 'metadata.json'];
    const missingFiles = [];

    for (const file of requiredFiles) {
      const filePath = path.join(folderPath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
        results.valid = false;
      }
    }

    if (missingFiles.length > 0) {
      results.errors.push(`Missing required files: ${missingFiles.join(', ')}`);
    }

    // Validate workflow.json
    const workflowPath = path.join(folderPath, 'workflow.json');
    if (fs.existsSync(workflowPath)) {
      try {
        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
        
        // Basic n8n workflow structure validation
        if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
          results.errors.push('workflow.json must contain a nodes array');
          results.valid = false;
        }

        if (!workflow.connections) {
          results.warnings.push('workflow.json should contain connections object');
        }

        // Validate against schema if available
        if (this.workflowSchema && !this.ajv.validate(this.workflowSchema, workflow)) {
          results.errors.push(`Workflow schema validation failed: ${this.ajv.errorsText()}`);
          results.valid = false;
        }

      } catch (error) {
        results.errors.push(`Invalid JSON in workflow.json: ${error.message}`);
        results.valid = false;
      }
    }

    // Validate metadata.json
    const metadataPath = path.join(folderPath, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        
        // Required metadata fields
        const requiredFields = ['name', 'description', 'version', 'category'];
        const missingMetaFields = requiredFields.filter(field => !metadata[field]);
        
        if (missingMetaFields.length > 0) {
          results.errors.push(`Missing required metadata fields: ${missingMetaFields.join(', ')}`);
          results.valid = false;
        }

        // Validate version format (semantic versioning)
        if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
          results.warnings.push('Version should follow semantic versioning (x.y.z)');
        }

        // Validate against schema if available
        if (this.metadataSchema && !this.ajv.validate(this.metadataSchema, metadata)) {
          results.errors.push(`Metadata schema validation failed: ${this.ajv.errorsText()}`);
          results.valid = false;
        }

      } catch (error) {
        results.errors.push(`Invalid JSON in metadata.json: ${error.message}`);
        results.valid = false;
      }
    }

    // Validate README.md completeness
    const readmePath = path.join(folderPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      const requiredSections = [
        '# ', // Title
        '## Overview',
        '## Technical Specification',
        '### Input Requirements',
        '### Processing Logic',
        '### Output Specification'
      ];

      const missingSections = requiredSections.filter(section => 
        !readmeContent.includes(section)
      );

      if (missingSections.length > 0) {
        results.warnings.push(`README.md missing recommended sections: ${missingSections.join(', ')}`);
      }
    }

    // Display results
    if (results.errors.length > 0) {
      console.log(`  ❌ Errors:`);
      results.errors.forEach(error => console.log(`    - ${error}`));
    }

    if (results.warnings.length > 0) {
      console.log(`  ⚠️  Warnings:`);
      results.warnings.forEach(warning => console.log(`    - ${warning}`));
    }

    if (results.valid && results.warnings.length === 0) {
      console.log(`  ✅ Valid`);
    }

    return results;
  }

  validateAllWorkflows() {
    const workflowsDir = './workflows';
    let totalValid = 0;
    let totalInvalid = 0;

    if (!fs.existsSync(workflowsDir)) {
      console.error('Error: workflows directory not found');
      process.exit(1);
    }

    const categories = fs.readdirSync(workflowsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log('🔍 Validating all workflows...\n');

    for (const category of categories) {
      const categoryPath = path.join(workflowsDir, category);
      console.log(`Category: ${category}`);
      
      const workflows = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const workflow of workflows) {
        const workflowPath = path.join(categoryPath, workflow);
        const result = this.validateWorkflowFolder(workflowPath);
        
        if (result.valid) {
          totalValid++;
        } else {
          totalInvalid++;
        }
      }
    }

    console.log(`\n📊 Validation Summary:`);
    console.log(`  Valid workflows: ${totalValid}`);
    console.log(`  Invalid workflows: ${totalInvalid}`);
    console.log(`  Total workflows: ${totalValid + totalInvalid}`);

    if (totalInvalid > 0) {
      process.exit(1);
    }
  }

  checkConsistency() {
    // Check for duplicate workflow names across categories
    const workflowNames = new Map();
    const duplicates = [];

    this.scanAllWorkflows((workflowPath, metadata) => {
      if (metadata.name) {
        if (workflowNames.has(metadata.name)) {
          duplicates.push({
            name: metadata.name,
            paths: [workflowNames.get(metadata.name), workflowPath]
          });
        } else {
          workflowNames.set(metadata.name, workflowPath);
        }
      }
    });

    if (duplicates.length > 0) {
      console.log('❌ Duplicate workflow names found:');
      duplicates.forEach(dup => {
        console.log(`  - "${dup.name}" in:`);
        dup.paths.forEach(path => console.log(`    ${path}`));
      });
      process.exit(1);
    } else {
      console.log('✅ No duplicate workflow names found');
    }
  }

  scanAllWorkflows(callback) {
    const workflowsDir = './workflows';
    const categories = fs.readdirSync(workflowsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());

    categories.forEach(category => {
      const categoryPath = path.join(workflowsDir, category.name);
      const workflows = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

      workflows.forEach(workflow => {
        const workflowPath = path.join(categoryPath, workflow.name);
        const metadataPath = path.join(workflowPath, 'metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            callback(workflowPath, metadata);
          } catch (error) {
            console.warn(`Warning: Could not parse metadata for ${workflowPath}`);
          }
        }
      });
    });
  }
}

// CLI handling
const args = process.argv.slice(2);
const validator = new WorkflowValidator();

if (args.includes('--check-consistency')) {
  validator.checkConsistency();
} else if (args.includes('--check-readme')) {
  console.log('README completeness check is included in the main validation');
  validator.validateAllWorkflows();
} else {
  validator.validateAllWorkflows();
}