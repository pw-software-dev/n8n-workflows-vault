#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { WorkflowMetadata, ResourceUsage } from '../types/workflow';

type MigrationFunction = (workflowPath: string, currentVersion: string) => string;

interface MigrationSummary {
  migrated: number;
  skipped: number;
  failed: number;
  total: number;
}

class WorkflowMigrator {
  private migrations: Map<string, MigrationFunction>;

  constructor() {
    this.migrations = new Map([
      ['1.0.0', this.migrateToV1_0_0.bind(this)],
      ['1.1.0', this.migrateToV1_1_0.bind(this)],
      ['1.2.0', this.migrateToV1_2_0.bind(this)]
    ]);
  }

  // Migration to version 1.0.0 (initial structure)
  private migrateToV1_0_0(workflowPath: string, currentVersion: string): string {
    console.log(`Migrating ${workflowPath} from ${currentVersion} to 1.0.0`);
    
    const metadataPath = path.join(workflowPath, 'metadata.json');
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata: WorkflowMetadata = JSON.parse(metadataContent);
    
    // Ensure basic required fields exist
    if (!metadata.category) {
      metadata.category = 'uncategorized';
    }
    
    if (!metadata.tags) {
      metadata.tags = [];
    }
    
    if (!metadata.version) {
      metadata.version = '1.0.0';
    }
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    return '1.0.0';
  }

  // Migration to version 1.1.0 (add performance metrics)
  private migrateToV1_1_0(workflowPath: string, currentVersion: string): string {
    console.log(`Migrating ${workflowPath} from ${currentVersion} to 1.1.0`);
    
    const metadataPath = path.join(workflowPath, 'metadata.json');
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata: WorkflowMetadata = JSON.parse(metadataContent);
    
    // Add performance characteristics if missing
    if (!metadata.execution_time) {
      metadata.execution_time = 'Unknown';
    }
    
    if (!metadata.complexity) {
      metadata.complexity = 'medium';
    }
    
    if (!metadata.resources) {
      metadata.resources = {
        memory: 'medium',
        cpu: 'medium',
        storage: 'minimal'
      } as ResourceUsage;
    }
    
    metadata.version = '1.1.0';
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    return '1.1.0';
  }

  // Migration to version 1.2.0 (add n8n version and enhanced requirements)
  private migrateToV1_2_0(workflowPath: string, currentVersion: string): string {
    console.log(`Migrating ${workflowPath} from ${currentVersion} to 1.2.0`);
    
    const metadataPath = path.join(workflowPath, 'metadata.json');
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata: WorkflowMetadata = JSON.parse(metadataContent);
    
    // Add n8n version if missing
    if (!metadata.n8n_version) {
      metadata.n8n_version = '1.0.0'; // Default to a reasonable version
    }
    
    // Enhance requirements structure
    if (!metadata.requirements) {
      metadata.requirements = {};
    }
    
    if (!metadata.requirements.credentials) {
      metadata.requirements.credentials = [];
    }
    
    if (!metadata.requirements.nodes) {
      metadata.requirements.nodes = [];
    }
    
    if (!metadata.requirements.environment_variables) {
      metadata.requirements.environment_variables = [];
    }
    
    // Add triggers if missing
    if (!metadata.triggers) {
      metadata.triggers = ['manual'];
    }
    
    metadata.version = '1.2.0';
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    return '1.2.0';
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  private getNextVersion(currentVersion: string, targetVersion?: string): string | null {
    const availableVersions = Array.from(this.migrations.keys()).sort((a, b) => 
      this.compareVersions(a, b)
    );
    
    for (const version of availableVersions) {
      if (this.compareVersions(currentVersion, version) < 0) {
        if (!targetVersion || this.compareVersions(version, targetVersion) <= 0) {
          return version;
        }
      }
    }
    
    return null;
  }

  migrateWorkflow(workflowPath: string, targetVersion?: string): string {
    const metadataPath = path.join(workflowPath, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`metadata.json not found in ${workflowPath}`);
    }
    
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata: WorkflowMetadata = JSON.parse(metadataContent);
    let currentVersion = metadata.version || '0.0.0';
    
    console.log(`Starting migration for ${path.basename(workflowPath)}`);
    console.log(`Current version: ${currentVersion}`);
    
    if (targetVersion) {
      console.log(`Target version: ${targetVersion}`);
    }
    
    let nextVersion = this.getNextVersion(currentVersion, targetVersion);
    
    while (nextVersion) {
      const migrationFunc = this.migrations.get(nextVersion);
      
      if (migrationFunc) {
        try {
          currentVersion = migrationFunc(workflowPath, currentVersion);
          console.log(`✅ Successfully migrated to ${currentVersion}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Migration to ${nextVersion} failed: ${errorMessage}`);
          throw error;
        }
      }
      
      nextVersion = this.getNextVersion(currentVersion, targetVersion);
    }
    
    console.log(`Migration complete. Final version: ${currentVersion}`);
    return currentVersion;
  }

  migrateAllWorkflows(targetVersion?: string): MigrationSummary {
    const workflowsDir = './workflows';
    
    if (!fs.existsSync(workflowsDir)) {
      console.error('Error: workflows directory not found');
      process.exit(1);
    }

    console.log('🔄 Starting migration for all workflows...\n');
    
    if (targetVersion) {
      console.log(`Target version: ${targetVersion}\n`);
    }

    const categories = fs.readdirSync(workflowsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    let migrated = 0;
    let failed = 0;
    let skipped = 0;

    for (const category of categories) {
      const categoryPath = path.join(workflowsDir, category);
      console.log(`Category: ${category}`);
      
      const workflows = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const workflow of workflows) {
        const workflowPath = path.join(categoryPath, workflow);
        
        try {
          if (!fs.existsSync(path.join(workflowPath, 'metadata.json'))) {
            console.log(`  ⚠️  Skipping ${workflow}: metadata.json not found`);
            skipped++;
            continue;
          }

          const initialVersion = this.getWorkflowVersion(workflowPath);
          const finalVersion = this.migrateWorkflow(workflowPath, targetVersion);
          
          if (finalVersion !== initialVersion) {
            migrated++;
          } else {
            console.log(`  ℹ️  ${workflow} already at target version`);
            skipped++;
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`  ❌ Failed to migrate ${workflow}: ${errorMessage}`);
          failed++;
        }
        
        console.log(''); // Add spacing between workflows
      }
    }

    const summary: MigrationSummary = {
      migrated,
      skipped,
      failed,
      total: migrated + skipped + failed
    };

    console.log(`📊 Migration Summary:`);
    console.log(`  Migrated: ${summary.migrated}`);
    console.log(`  Skipped: ${summary.skipped}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Total: ${summary.total}`);

    if (failed > 0) {
      process.exit(1);
    }

    return summary;
  }

  private getWorkflowVersion(workflowPath: string): string {
    const metadataPath = path.join(workflowPath, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return '0.0.0';
    }
    
    try {
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      const metadata: WorkflowMetadata = JSON.parse(metadataContent);
      return metadata.version || '0.0.0';
    } catch (error) {
      return '0.0.0';
    }
  }

  listAvailableVersions(): void {
    console.log('Available migration versions:');
    const versions = Array.from(this.migrations.keys()).sort((a, b) => 
      this.compareVersions(a, b)
    );
    
    versions.forEach(version => {
      console.log(`  - ${version}`);
    });
  }
}

// CLI handling
const args = process.argv.slice(2);
const migrator = new WorkflowMigrator();

if (args.includes('--list-versions')) {
  migrator.listAvailableVersions();
} else if (args.includes('--target')) {
  const targetIndex = args.indexOf('--target');
  const targetVersion = args[targetIndex + 1];
  
  if (!targetVersion) {
    console.error('Error: --target requires a version number');
    process.exit(1);
  }
  
  if (args.length > 2 && !args.includes('--target')) {
    // Migrate specific workflow
    const workflowPath = args[0]!;
    try {
      migrator.migrateWorkflow(workflowPath, targetVersion);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  } else {
    // Migrate all workflows
    migrator.migrateAllWorkflows(targetVersion);
  }
} else if (args.length === 1 && fs.existsSync(args[0]!)) {
  // Migrate specific workflow to latest
  try {
    migrator.migrateWorkflow(args[0]!);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
} else {
  // Migrate all workflows to latest
  migrator.migrateAllWorkflows();
}