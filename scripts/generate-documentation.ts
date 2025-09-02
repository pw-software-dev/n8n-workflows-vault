#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { exec } from "child_process";
import { promisify } from "util";
require("dotenv").config();

const execAsync = promisify(exec);

interface ProcessingSummary {
  generated: number;
  failed: number;
  total: number;
  readmesGenerated: number;
  validationPassed: boolean;
}

class DocumentationGenerator {
  private readonly metadataSchema = `{
  "name": "Your Workflow Name",
  "description": "Brief description of what this workflow does",
  "version": "1.0.0",
  "tags": ["tag1", "tag2"],
  "author": "pw-software",
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
1. Extract workflow name from "name" field - MUST only contain letters, numbers, spaces, hyphens, underscores (no symbols like &, +, etc.)
2. Write descriptive summary (10-500 characters)
3. Keep version as "1.0.0" unless workflow name indicates otherwise (e.g., "v2")
5. Tags MUST be lowercase kebab-case only (e.g., "html", "redis", "webhook" NOT "HTML", "Redis", "Webhook")
6. Keep author as "pw-software"
7. Keep dates as "2024-08-30"
8. Keep n8n_version as "1.45.0"
9. Requirements:
  - credentials: Extract credential names from nodes with "credentials" property
  - nodes: List full node types (e.g., "n8n-nodes-base.webhook", "n8n-nodes-base.notion")
  - environment_variables: Leave empty array unless obvious
10. Triggers: webhook, cron, manual, etc.
11. Complexity: simple/medium/complex (based on node count and logic)
12. Execution time: "15-30 seconds", "30-60 seconds", "1-2 minutes", etc.
13. Resources:
    - memory: low/medium/high
    - cpu: low/medium/high  
    - storage: minimal/low/medium/high

CRITICAL VALIDATION RULES:
- Name: Only A-Z, a-z, 0-9, spaces, hyphens, underscores
- Tags: lowercase kebab-case only (no uppercase letters)
- All strings must follow exact patterns above

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

  private validateAndFixMetadata(metadata: any): any {
    // Fix name - remove special characters not allowed by schema
    if (metadata.name) {
      metadata.name = metadata.name.replace(/[^A-Za-z0-9\s\-_]/g, "").trim();
    }

    // Fix tags - convert to lowercase kebab-case
    if (metadata.tags && Array.isArray(metadata.tags)) {
      metadata.tags = metadata.tags.map((tag: string) =>
        tag
          .toLowerCase()
          .replace(/[^a-z0-9\-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }

    // Fix triggers - ensure lowercase
    if (metadata.triggers && Array.isArray(metadata.triggers)) {
      metadata.triggers = metadata.triggers.map((trigger: string) =>
        trigger.toLowerCase(),
      );
    }

    // Fix complexity - ensure valid values
    if (metadata.complexity) {
      const validComplexity = ["simple", "medium", "complex"];
      if (!validComplexity.includes(metadata.complexity.toLowerCase())) {
        metadata.complexity = "medium"; // Default fallback
      } else {
        metadata.complexity = metadata.complexity.toLowerCase();
      }
    }

    // Fix resource levels - ensure valid values
    if (metadata.resources) {
      const validLevels = ["minimal", "low", "medium", "high"];

      if (
        metadata.resources.memory &&
        !validLevels.includes(metadata.resources.memory.toLowerCase())
      ) {
        metadata.resources.memory = "low";
      } else if (metadata.resources.memory) {
        metadata.resources.memory = metadata.resources.memory.toLowerCase();
      }

      if (
        metadata.resources.cpu &&
        !validLevels.includes(metadata.resources.cpu.toLowerCase())
      ) {
        metadata.resources.cpu = "medium";
      } else if (metadata.resources.cpu) {
        metadata.resources.cpu = metadata.resources.cpu.toLowerCase();
      }

      if (
        metadata.resources.storage &&
        !validLevels.includes(metadata.resources.storage.toLowerCase())
      ) {
        metadata.resources.storage = "minimal";
      } else if (metadata.resources.storage) {
        metadata.resources.storage = metadata.resources.storage.toLowerCase();
      }
    }

    return metadata;
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

      // Post-process and validate the metadata
      metadataJson = this.validateAndFixMetadata(metadataJson);

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

    console.log("📚 Generating complete documentation for workflows...\n");

    const workflows = fs
      .readdirSync(workflowsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let generated = 0;
    let failed = 0;
    let readmesGenerated = 0;

    for (const workflow of workflows) {
      const workflowPath = path.join(workflowsDir, workflow);

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

    // Run final validation on all workflows
    console.log(`\n🔍 Running final validation on all workflows...`);
    let validationPassed = false;

    try {
      const { stdout, stderr } = await execAsync("pnpm validate-all-workflows");

      if (stderr) {
        console.log(`⚠️  Validation warnings: ${stderr}`);
      }

      // Check if validation passed by looking for success indicators
      if (stdout.includes("Invalid workflows: 0")) {
        console.log(`✅ All workflows passed validation`);
        validationPassed = true;
      } else {
        console.log(`❌ Some workflows failed validation`);
        console.log(stdout);
      }
    } catch (error) {
      console.log(`❌ Validation failed with error`);
      validationPassed = false;
    }

    const summary: ProcessingSummary = {
      generated,
      failed,
      total: generated + failed,
      readmesGenerated,
      validationPassed,
    };

    console.log(`\n📊 Documentation Generation Summary:`);
    console.log(`  Metadata Generated: ${summary.generated}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  READMEs Generated: ${summary.readmesGenerated}`);
    console.log(`  Total Processed: ${summary.total}`);
    console.log(
      `  Final Validation: ${validationPassed ? "✅ Passed" : "❌ Failed"}`,
    );

    if (!validationPassed && summary.generated > 0) {
      console.log(
        `\n⚠️  Warning: Some generated documentation may have validation issues`,
      );
    }

    return summary;
  }

  async processSpecificWorkflow(workflowPath: string): Promise<void> {
    if (!fs.existsSync(workflowPath)) {
      console.error(`Error: Workflow path ${workflowPath} not found`);
      process.exit(1);
    }

    console.log(
      `📚 Processing workflow documentation: ${path.basename(workflowPath)}\n`,
    );

    const success = await this.processWorkflow(workflowPath);

    if (success) {
      console.log(`\n📝 Generating README...`);
      await this.generateReadme(workflowPath);

      // Validate the specific workflow
      console.log(`\n🔍 Validating workflow...`);
      try {
        const { stdout, stderr } = await execAsync(
          `pnpm validate-all-workflows`,
        );

        if (stderr) {
          console.log(`⚠️  Validation warnings: ${stderr}`);
        }

        if (stdout.includes("Invalid workflows: 0")) {
          console.log(`✅ Workflow validation passed`);
        } else {
          console.log(`❌ Workflow validation failed`);
          console.log(stdout);
        }
      } catch (error) {
        console.log(`❌ Validation failed with error: ${error}`);
      }

      console.log(
        `\n✅ Successfully processed documentation for ${path.basename(
          workflowPath,
        )}`,
      );
    } else {
      console.log(`\n❌ Failed to process ${path.basename(workflowPath)}`);
      process.exit(1);
    }
  }
}

// CLI handling
const args = process.argv.slice(2);
const generator = new DocumentationGenerator();

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
