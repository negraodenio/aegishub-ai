import crypto from "node:crypto";
import type { CodeChunk, RepoNode } from "./types";

const MAX_LINES = 80;
const OVERLAP = 10;

export function chunkFile(node: RepoNode, content: string): CodeChunk[] {
  const lines = content.split("\n");
  const chunks: CodeChunk[] = [];

  if (lines.length <= MAX_LINES) {
    return [
      {
        id: crypto.createHash("sha256").update(`${node.path}:0:${lines.length - 1}`).digest("hex").slice(0, 16),
        repoNodeId: node.id,
        path: node.path,
        content,
        startLine: 0,
        endLine: lines.length - 1
      }
    ];
  }

  let start = 0;
  while (start < lines.length) {
    const end = Math.min(start + MAX_LINES - 1, lines.length - 1);
    chunks.push({
      id: crypto.createHash("sha256").update(`${node.path}:${start}:${end}`).digest("hex").slice(0, 16),
      repoNodeId: node.id,
      path: node.path,
      content: lines.slice(start, end + 1).join("\n"),
      startLine: start,
      endLine: end
    });
    start = end + 1 - OVERLAP;
  }

  return chunks;
}
