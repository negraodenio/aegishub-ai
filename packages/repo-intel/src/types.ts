export interface RepoNode {
  id: string;
  path: string;
  kind: "file" | "function" | "component" | "route" | "schema" | "migration" | "prompt" | "test" | "config";
  language: "typescript" | "sql" | "json" | "md" | "other";
  summary?: string;
  symbols?: string[];
  imports?: string[];
  tags?: string[];
}

export interface CodeChunk {
  id: string;
  repoNodeId: string;
  path: string;
  content: string;
  startLine: number;
  endLine: number;
  symbolName?: string;
}

export interface PatchRequest {
  task: string;
  candidatePaths: string[];
  constraints?: string[];
}

export interface PatchProposal {
  path: string;
  diff: string;
  summary: string;
  riskLevel: "low" | "medium" | "high";
  reviewRequired: boolean;
}
