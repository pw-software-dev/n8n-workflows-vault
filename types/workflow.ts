export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  disabled?: boolean;
}

export interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface WorkflowConnections {
  [nodeName: string]: {
    [connectionType: string]: WorkflowConnection[][];
  };
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  active?: boolean;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: string[];
  pinData?: Record<string, any>;
  versionId?: string;
  triggerCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowRequirements {
  credentials?: string[];
  nodes?: string[];
  environment_variables?: string[];
}

export interface ResourceUsage {
  memory: "minimal" | "low" | "medium" | "high" | "very-high";
  cpu: "minimal" | "low" | "medium" | "high" | "very-high";
  storage: "minimal" | "low" | "medium" | "high" | "very-high";
}

export interface WorkflowMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  created?: string;
  updated?: string;
  tags?: string[];
  complexity?: "simple" | "medium" | "complex";
  execution_time?: string;
  n8n_version?: string;
  requirements?: WorkflowRequirements;
  resources?: ResourceUsage;
  triggers?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationSummary {
  totalValid: number;
  totalInvalid: number;
  totalWorkflows: number;
}
