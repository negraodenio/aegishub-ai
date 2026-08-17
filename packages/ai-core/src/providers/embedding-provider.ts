/**
 * 🔢 Embedding Provider for pgvector (1536 Dimensions)
 * Generates 1536-dimensional float vectors compatible with PostgreSQL vector(1536).
 *
 * Capabilities:
 * - Server-side only (never exposes API keys).
 * - Real remote generation via OpenRouter/text-embedding-3-small.
 * - Deterministic L2-normalized fallback for offline/test environments.
 */

import crypto from "crypto";

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: string;
  isFallback: boolean;
}

export class EmbeddingProvider {
  private apiKey: string | null;
  private model: string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || null;
    this.model = options.model || "openai/text-embedding-3-small";
  }

  /**
   * Generates a deterministic 1536-dim unit vector from text (Offline/Test Fallback)
   */
  public generateDeterministicEmbedding(text: string): number[] {
    const vector: number[] = new Array(1536).fill(0);
    const hash = crypto.createHash("sha256").update(text || "").digest();

    let sumSquares = 0;
    for (let i = 0; i < 1536; i++) {
      const byteVal = hash[i % hash.length] || 1;
      const seed = Math.sin((i + 1) * byteVal) * 10000;
      const val = seed - Math.floor(seed);
      vector[i] = val;
      sumSquares += val * val;
    }

    // Normalize to L2 unit norm (sum of squares = 1) for cosine distance
    const norm = Math.sqrt(sumSquares) || 1;
    return vector.map((v) => v / norm);
  }

  /**
   * Generates a 1536-dimensional vector for a query or document
   */
  public async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const cleanText = (text || "").trim().slice(0, 8000);

    if (!this.apiKey || cleanText.length === 0) {
      const fallbackVector = this.generateDeterministicEmbedding(cleanText);
      return {
        embedding: fallbackVector,
        dimensions: 1536,
        model: "deterministic-1536-fallback",
        isFallback: true
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          input: cleanText
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          embedding: this.generateDeterministicEmbedding(cleanText),
          dimensions: 1536,
          model: "deterministic-1536-fallback",
          isFallback: true
        };
      }

      const json = await response.json();
      const rawVector = json?.data?.[0]?.embedding;

      if (Array.isArray(rawVector) && rawVector.length === 1536) {
        return {
          embedding: rawVector,
          dimensions: 1536,
          model: this.model,
          isFallback: false
        };
      }

      return {
        embedding: this.generateDeterministicEmbedding(cleanText),
        dimensions: 1536,
        model: "deterministic-1536-fallback",
        isFallback: true
      };
    } catch {
      return {
        embedding: this.generateDeterministicEmbedding(cleanText),
        dimensions: 1536,
        model: "deterministic-1536-fallback",
        isFallback: true
      };
    }
  }
}
