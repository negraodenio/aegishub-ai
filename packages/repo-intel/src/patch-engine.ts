import type { PatchProposal, PatchRequest } from "./types";

export function buildPatchPlan(request: PatchRequest): PatchProposal[] {
  return request.candidatePaths.map((path) => ({
    path,
    diff: `--- a/${path}\n+++ b/${path}\n@@ ...`,
    summary: `Update ${path} for task: ${request.task}`,
    riskLevel: "medium",
    reviewRequired: true
  }));
}
