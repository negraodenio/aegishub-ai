export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
}

interface BucketEntry {
  tokens: number;
  lastReset: number;
}

/**
 * 🛡️ Token Bucket Rate Limiter com suporte a janelas deslizantes e isolamento por chave
 * - Chaves compostas: `ip:${ip}`, `user:${userId}`, `tenant:${tenantId}`
 * - Resposta com headers RFC 6585 (Retry-After, X-RateLimit-*)
 */
export class RateLimiter {
  private buckets: Map<string, BucketEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: "rl",
      ...config
    };
  }

  /**
   * Avalia e consome 1 token para a chave informada
   */
  public check(key: string): RateLimitResult {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    let entry = this.buckets.get(fullKey);

    if (!entry || now - entry.lastReset > this.config.windowMs) {
      entry = {
        tokens: this.config.maxRequests - 1,
        lastReset: now
      };
      this.buckets.set(fullKey, entry);

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: entry.tokens,
        resetMs: this.config.windowMs,
        retryAfterSeconds: 0
      };
    }

    if (entry.tokens > 0) {
      entry.tokens -= 1;
      const timeRemaining = this.config.windowMs - (now - entry.lastReset);

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: entry.tokens,
        resetMs: timeRemaining,
        retryAfterSeconds: 0
      };
    }

    // Limite excedido
    const timeRemaining = Math.max(1000, this.config.windowMs - (now - entry.lastReset));
    const retryAfter = Math.ceil(timeRemaining / 1000);

    return {
      success: false,
      limit: this.config.maxRequests,
      remaining: 0,
      resetMs: timeRemaining,
      retryAfterSeconds: retryAfter
    };
  }

  /**
   * Limpa entradas expiradas para prevenir vazamento de memória
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.buckets.entries()) {
      if (now - entry.lastReset > this.config.windowMs * 2) {
        this.buckets.delete(key);
      }
    }
  }

  public reset(key: string): void {
    this.buckets.delete(`${this.config.keyPrefix}:${key}`);
  }
}

// Instâncias pré-configuradas para endpoints de alta carga
export const voiceRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 10 reqs/minuto
  keyPrefix: "voice"
});

export const reportGenerationRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 relatórios pesados/minuto
  keyPrefix: "report"
});

export const evidenceUploadRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 20 uploads/minuto
  keyPrefix: "upload"
});
