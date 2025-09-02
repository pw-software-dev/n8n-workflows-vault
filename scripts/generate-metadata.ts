#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { exec } from "child_process";
import { promisify } from "util";
require("dotenv").config();

console.log(process.env);

const execAsync = promisify(exec);

interface ProcessingSummary {
  generated: number;
  failed: number;
  total: number;
  readmesGenerated: number;
}

class MetadataGenerator {
  private readonly metadataSchema = `{
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
}`;

  private readonly prompt = `You are an expert n8n workflow analyst. Your task is to analyze a workflow.json file and generate accurate metadata that follows a specific schema.

Given the workflow.json content, fill in the metadata.json template with accurate values based on the workflow analysis:

INSTRUCTIONS:
1. Extract the workflow name from the "name" field in the workflow.json
2. Analyze the nodes array to understand what the workflow does and write a descriptive summary
3. Keep version as "1.0.0" unless workflow name indicates otherwise (e.g., "v2")
4. Categorize appropriately (productivity, integration, notification, data-processing, etc.)
5. Generate relevant tags based on functionality and services used
6. Keep author as "your-team"
7. Keep the created/updated dates as provided in template
8. Keep n8n_version as "1.45.0"
9. For requirements:
	- credentials: Extract from nodes that have "credentials" property
	- nodes: List unique node types (e.g., "n8n-nodes-base.webhook", "n8n-nodes-base.notion")
	- environment_variables: Leave empty unless obvious from workflow
10. For triggers: Identify trigger types (webhook, cron, manual, etc.)
11. Assess complexity based on number of nodes and logic complexity (simple/medium/complex)
12. Estimate execution time based on operations (15-30s, 30-60s, 1-2min, etc.)
13. For resources, assess:
    - memory: low/medium/high based on data processing
    - cpu: low/medium/high based on computational complexity
    - storage: minimal/low/medium/high based on file operations

CRITICAL: Return ONLY the raw JSON object. Do not wrap it in markdown code blocks, backticks, or any other formatting. Do not include any explanation text before or after the JSON. Your entire response should be valid JSON that can be parsed directly.`;

  private async generateMetadata(workflowJsonContent: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: this.prompt,
        },
        {
          role: "user",
          content: `Template to fill:\n${this.metadataSchema}\n\nWorkflow to analyze:\n${workflowJsonContent}`,
        },
      ],
      maxOutputTokens: 1000,
      temperature: 0.1,
    });

    return text.trim();
  }

  private async processWorkflow(workflowPath: string): Promise<boolean> {
    const workflowJsonPath = path.join(workflowPath, "workflow.json");
    const metadataJsonPath = path.join(workflowPath, "metadata.json");

    // Check if workflow.json exists and metadata.json doesn't
    if (!fs.existsSync(workflowJsonPath)) {
      console.log(
        `  ⚠️  Skipping ${path.basename(
          workflowPath,
        )}: workflow.json not found`,
      );
      return false;
    }

    if (fs.existsSync(metadataJsonPath)) {
      console.log(
        `  ℹ️  Skipping ${path.basename(
          workflowPath,
        )}: metadata.json already exists`,
      );
      return false;
    }

    try {
      // Read workflow.json
      const workflowContent = fs.readFileSync(workflowJsonPath, "utf8");

      console.log(`  🔍 Analyzing ${path.basename(workflowPath)}...`);

      // Generate metadata using AI
      let generatedMetadata = await this.generateMetadata(workflowContent);

      // Clean up any markdown formatting if present
      generatedMetadata = generatedMetadata.trim();
      if (generatedMetadata.startsWith("```json")) {
        generatedMetadata = generatedMetadata
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
      } else if (generatedMetadata.startsWith("```")) {
        generatedMetadata = generatedMetadata
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
      }

      // Validate that it's valid JSON
      let metadataJson;
      try {
        metadataJson = JSON.parse(generatedMetadata);
      } catch (parseError) {
        console.log(
          `Raw AI response: ${generatedMetadata.substring(0, 200)}...`,
        );
        throw new Error(`Generated metadata is not valid JSON: ${parseError}`);
      }

      // Write metadata.json
      fs.writeFileSync(
        metadataJsonPath,
        JSON.stringify(metadataJson, null, 2),
        "utf8",
      );

      console.log(
        `  ✅ Generated metadata.json for ${path.basename(workflowPath)}`,
      );
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(
        `  ❌ Failed to generate metadata for ${path.basename(
          workflowPath,
        )}: ${errorMessage}`,
      );
      return false;
    }
  }

  private async generateReadme(workflowPath: string): Promise<boolean> {
    try {
      const { stderr } = await execAsync(
        `pnpm generate-readme "${workflowPath}"`,
      );

      if (stderr) {
        console.log(`  ⚠️  README generation warnings: ${stderr}`);
      }

      console.log(`  📄 Generated README for ${path.basename(workflowPath)}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(
        `  ❌ Failed to generate README for ${path.basename(
          workflowPath,
        )}: ${errorMessage}`,
      );
      return false;
    }
  }

  async processAllWorkflows(): Promise<ProcessingSummary> {
    const workflowsDir = "./workflows";

    if (!fs.existsSync(workflowsDir)) {
      console.error("Error: workflows directory not found");
      process.exit(1);
    }

    console.log(
      "🤖 Generating metadata.json files for workflows missing them...\n",
    );

    const categories = fs
      .readdirSync(workflowsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let generated = 0;
    let failed = 0;
    let readmesGenerated = 0;

    for (const category of categories) {
      const categoryPath = path.join(workflowsDir, category);
      console.log(`📁 Category: ${category}`);

      const workflows = fs
        .readdirSync(categoryPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const workflow of workflows) {
        const workflowPath = path.join(categoryPath, workflow);

        const success = await this.processWorkflow(workflowPath);

        if (success) {
          generated++;

          // Generate README after successful metadata generation
          console.log(`  📝 Generating README...`);
          const readmeSuccess = await this.generateReadme(workflowPath);

          if (readmeSuccess) {
            readmesGenerated++;
          }
        } else {
          // Check if it failed due to missing metadata vs already exists
          const metadataExists = fs.existsSync(
            path.join(workflowPath, "metadata.json"),
          );
          if (!metadataExists) {
            failed++;
          }
        }
      }

      console.log(); // Empty line between categories
    }

    const summary: ProcessingSummary = {
      generated,
      failed,
      total: generated + failed,
      readmesGenerated,
    };

    console.log(`📊 Processing Summary:`);
    console.log(`  Metadata Generated: ${summary.generated}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  READMEs Generated: ${summary.readmesGenerated}`);
    console.log(`  Total Processed: ${summary.total}`);

    return summary;
  }

  async processSpecificWorkflow(workflowPath: string): Promise<void> {
    if (!fs.existsSync(workflowPath)) {
      console.error(`Error: Workflow path ${workflowPath} not found`);
      process.exit(1);
    }

    console.log(`🤖 Processing workflow: ${path.basename(workflowPath)}\n`);

    const success = await this.processWorkflow(workflowPath);

    if (success) {
      console.log(`\n📝 Generating README...`);
      await this.generateReadme(workflowPath);
      console.log(`\n✅ Successfully processed ${path.basename(workflowPath)}`);
    } else {
      console.log(`\n❌ Failed to process ${path.basename(workflowPath)}`);
      process.exit(1);
    }
  }
}

// CLI handling
const args = process.argv.slice(2);
const generator = new MetadataGenerator();

async function main(): Promise<void> {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is required");
    console.error(
      "Please set your OpenAI API key: export OPENAI_API_KEY=your_key_here",
    );
    process.exit(1);
  }

  if (args.length === 1 && fs.existsSync(args[0]!)) {
    // Process specific workflow
    await generator.processSpecificWorkflow(args[0]!);
  } else {
    // Process all workflows
    await generator.processAllWorkflows();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
