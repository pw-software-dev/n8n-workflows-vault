#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ReadmeGenerator {
  constructor() {
    this.templatePath = './templates/workflow-readme.md';
  }

  generateFromWorkflow(workflowPath) {
    try {
      const workflow = JSON.parse(fs.readFileSync(path.join(workflowPath, 'workflow.json'), 'utf8'));
      const metadata = JSON.parse(fs.readFileSync(path.join(workflowPath, 'metadata.json'), 'utf8'));

      // Load template
      if (!fs.existsSync(this.templatePath)) {
        throw new Error('README template not found at templates/workflow-readme.md');
      }
      
      const template = fs.readFileSync(this.templatePath, 'utf8');

      // Extract information from workflow JSON
      const triggerNodes = workflow.nodes?.filter(node => 
        node.type.includes('trigger') || node.type.includes('Trigger')
      ) || [];
      
      const processingNodes = workflow.nodes?.filter(node => 
        !node.type.includes('trigger') && !node.type.includes('Trigger')
      ) || [];

      // Generate README content
      let readmeContent = template
        .replace(/{Workflow Name}/g, metadata.name || 'Unnamed Workflow')
        .replace(/{Description}/g, metadata.description || 'No description provided')
        .replace(/{Version}/g, metadata.version || '1.0.0')
        .replace(/{Category}/g, metadata.category || 'uncategorized')
        .replace(/{Author}/g, metadata.author || 'Unknown')
        .replace(/{Created}/g, metadata.created || 'Unknown')
        .replace(/{Updated}/g, metadata.updated || 'Unknown')
        .replace(/{Tags}/g, metadata.tags ? metadata.tags.join(', ') : 'None')
        .replace(/{Trigger Type}/g, this.generateTriggerTypes(triggerNodes))
        .replace(/{Processing Steps}/g, this.generateProcessingSteps(processingNodes))
        .replace(/{Dependencies}/g, this.generateDependencies(metadata.requirements))
        .replace(/{Complexity}/g, metadata.complexity || 'Unknown')
        .replace(/{Execution Time}/g, metadata.execution_time || 'Unknown')
        .replace(/{N8N Version}/g, metadata.n8n_version || 'Unknown');

      return readmeContent;

    } catch (error) {
      throw new Error(`Failed to generate README for ${workflowPath}: ${error.message}`);
    }
  }

  generateTriggerTypes(triggerNodes) {
    if (triggerNodes.length === 0) {
      return 'Manual trigger';
    }
    
    return triggerNodes.map(node => {
      const nodeType = node.type.replace(/([A-Z])/g, ' $1').trim();
      return `**${nodeType}**`;
    }).join(', ');
  }

  generateProcessingSteps(processingNodes) {
    if (processingNodes.length === 0) {
      return '1. No processing nodes defined';
    }

    return processingNodes.map((node, index) => {
      const nodeType = node.type.replace(/([A-Z])/g, ' $1').trim();
      const nodeName = node.name || nodeType;
      return `${index + 1}. **${nodeName}** (${nodeType})`;
    }).join('\n');
  }

  generateDependencies(requirements) {
    if (!requirements) {
      return 'None specified';
    }

    let deps = [];
    
    if (requirements.credentials?.length) {
      deps.push(`**Credentials**: ${requirements.credentials.join(', ')}`);
    }
    
    if (requirements.nodes?.length) {
      deps.push(`**Nodes**: ${requirements.nodes.join(', ')}`);
    }
    
    if (requirements.environment_variables?.length) {
      deps.push(`**Environment Variables**: ${requirements.environment_variables.join(', ')}`);
    }

    return deps.length > 0 ? deps.join('\n') : 'None specified';
  }

  generateReadmeForWorkflow(workflowPath) {
    const readmeContent = this.generateFromWorkflow(workflowPath);
    const readmePath = path.join(workflowPath, 'README.md');
    
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log(`✅ Generated README for ${path.basename(workflowPath)}`);
  }

  generateAllReadmes() {
    const workflowsDir = './workflows';
    
    if (!fs.existsSync(workflowsDir)) {
      console.error('Error: workflows directory not found');
      process.exit(1);
    }

    console.log('📝 Generating README files for all workflows...\n');

    const categories = fs.readdirSync(workflowsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    let generated = 0;
    let failed = 0;

    for (const category of categories) {
      const categoryPath = path.join(workflowsDir, category);
      console.log(`Category: ${category}`);
      
      const workflows = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const workflow of workflows) {
        const workflowPath = path.join(categoryPath, workflow);
        
        try {
          // Check if required files exist
          if (!fs.existsSync(path.join(workflowPath, 'workflow.json'))) {
            console.log(`  ⚠️  Skipping ${workflow}: workflow.json not found`);
            continue;
          }
          
          if (!fs.existsSync(path.join(workflowPath, 'metadata.json'))) {
            console.log(`  ⚠️  Skipping ${workflow}: metadata.json not found`);
            continue;
          }

          this.generateReadmeForWorkflow(workflowPath);
          generated++;
          
        } catch (error) {
          console.log(`  ❌ Failed to generate README for ${workflow}: ${error.message}`);
          failed++;
        }
      }
    }

    console.log(`\n📊 Generation Summary:`);
    console.log(`  Generated: ${generated}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total: ${generated + failed}`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const generator = new ReadmeGenerator();

if (args.length === 1 && fs.existsSync(args[0])) {
  // Generate README for specific workflow
  try {
    generator.generateReadmeForWorkflow(args[0]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
} else {
  // Generate READMEs for all workflows
  generator.generateAllReadmes();
}