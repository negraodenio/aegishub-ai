import type { CodeChunk } from "./types";

export interface SearchResult {
  chunk: CodeChunk;
  score: number;
}

export interface SearchQuery {
  text: string;
  topK?: number;
  minScore?: number;
}

export interface VectorStore {
  search(query: SearchQuery): Promise<SearchResult[]>;
  upsert(chunks: CodeChunk[]): Promise<void>;
}
