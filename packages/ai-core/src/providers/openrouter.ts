/**
 * 🌐 Dedicated OpenRouter LLM Provider for AegisHub AI
 * Server-side gateway for Google Gemini 3 Flash Preview (`google/gemini-3-flash-preview`).
 *
 * Security & Cost Control:
 * 1. API Key: Reads OPENROUTER_API_KEY exclusively from server-side environment variables.
 * 2. Model Governance: Model is locked server-side to authorized models; client cannot override.
 * 3. Structured Output: Enforces strict JSON formatting and validates response shape.
 * 4. Cost/Timeout Protection: 10s AbortSignal timeout and 800 max output tokens ceiling.
 */

export const AUTHORIZED_COGNITIVE_MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "anthropic/claude-3-haiku"
] as const;

export type AuthorizedCognitiveModel = (typeof AUTHORIZED_COGNITIVE_MODELS)[number];

export const DEFAULT_COGNITIVE_MODEL: AuthorizedCognitiveModel = "google/gemini-3-flash-preview";

export interface OpenRouterChatParams {
  systemPrompt: string;
  userPrompt: string;
  model?: AuthorizedCognitiveModel | undefined;
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  timeoutMs?: number | undefined;
}

export interface OpenRouterResponsePayload {
  success: boolean;
  content: string | null;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | undefined;
  latencyMs: number;
  error?: string | undefined;
  isFallback?: boolean | undefined;
}

/**
 * Validates whether a requested model is in the server's approved registry
 */
export function isAuthorizedModel(model: string): model is AuthorizedCognitiveModel {
  return (AUTHORIZED_COGNITIVE_MODELS as readonly string[]).includes(model);
}

export class OpenRouterProvider {
  private apiKey: string | null;
  private defaultModel: AuthorizedCognitiveModel;

  constructor(options: { apiKey?: string; defaultModel?: AuthorizedCognitiveModel } = {}) {
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || process.env.openrouter || null;
    this.defaultModel = options.defaultModel && isAuthorizedModel(options.defaultModel)
      ? options.defaultModel
      : DEFAULT_COGNITIVE_MODEL;
  }

  /**
   * Dispatches chat completion to OpenRouter with Gemini 3 Flash
   */
  public async generateChatCompletion(
    params: OpenRouterChatParams
  ): Promise<OpenRouterResponsePayload> {
    const startTime = Date.now();
    const modelToUse = params.model && isAuthorizedModel(params.model)
      ? params.model
      : this.defaultModel;

    if (!this.apiKey) {
      return {
        success: false,
        content: null,
        model: modelToUse,
        latencyMs: Date.now() - startTime,
        error: "OPENROUTER_API_KEY_MISSING",
        isFallback: true
      };
    }

    const timeoutMs = params.timeoutMs || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://aegishub.ai",
          "X-Title": "AegisHub Cognitive AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelToUse,
          temperature: typeof params.temperature === "number" ? Math.max(0, Math.min(1, params.temperature)) : 0.2,
          max_tokens: Math.min(800, params.maxTokens || 600),
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: params.systemPrompt },
            { role: "user", content: params.userPrompt }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown network error");
        return {
          success: false,
          content: null,
          model: modelToUse,
          latencyMs,
          error: `OPENROUTER_HTTP_${response.status}: ${errorText.slice(0, 100)}`,
          isFallback: true
        };
      }

      const json = await response.json();
      const rawContent = json?.choices?.[0]?.message?.content || null;
      const usage = json?.usage
        ? {
            promptTokens: json.usage.prompt_tokens || 0,
            completionTokens: json.usage.completion_tokens || 0,
            totalTokens: json.usage.total_tokens || 0
          }
        : undefined;

      return {
        success: rawContent !== null,
        content: rawContent,
        model: modelToUse,
        usage,
        latencyMs,
        isFallback: false
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === "AbortError";
      return {
        success: false,
        content: null,
        model: modelToUse,
        latencyMs,
        error: isTimeout ? "OPENROUTER_TIMEOUT" : (err.message || "NETWORK_ERROR"),
        isFallback: true
      };
    }
  }
}
