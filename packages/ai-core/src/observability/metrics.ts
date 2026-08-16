export interface RequestMetricsSummary {
  totalRequests: number;
  totalErrors: number;
  statusDistribution: {
    "2xx": number;
    "4xx": number;
    "5xx": number;
  };
  rateLimitEvents: number;
  avgDurationMs: number | null;
  hasSufficientData: boolean;
}

export interface AIMetricsSummary {
  totalInferences: number;
  successfulInferences: number;
  failedInferences: number;
  avgDurationMs: number | null;
  hasSufficientData: boolean;
}

export class OperationalMetricsCollector {
  private requestCount: number = 0;
  private errorCount: number = 0;
  private status2xx: number = 0;
  private status4xx: number = 0;
  private status5xx: number = 0;
  private rateLimitCount: number = 0;
  private totalDurationMs: number = 0;

  // Métricas de IA
  private aiInferencesCount: number = 0;
  private aiSuccessCount: number = 0;
  private aiFailCount: number = 0;
  private aiDurationMs: number = 0;

  public recordRequest(status: number, durationMs: number, isRateLimited: boolean = false): void {
    this.requestCount += 1;
    this.totalDurationMs += durationMs;

    if (status >= 200 && status < 300) {
      this.status2xx += 1;
    } else if (status >= 400 && status < 500) {
      this.status4xx += 1;
      this.errorCount += 1;
    } else if (status >= 500) {
      this.status5xx += 1;
      this.errorCount += 1;
    }

    if (isRateLimited || status === 429) {
      this.rateLimitCount += 1;
    }
  }

  public recordAIInference(success: boolean, durationMs: number): void {
    this.aiInferencesCount += 1;
    this.aiDurationMs += durationMs;
    if (success) {
      this.aiSuccessCount += 1;
    } else {
      this.aiFailCount += 1;
    }
  }

  public getRequestMetrics(): RequestMetricsSummary {
    const hasData = this.requestCount >= 10;
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      statusDistribution: {
        "2xx": this.status2xx,
        "4xx": this.status4xx,
        "5xx": this.status5xx
      },
      rateLimitEvents: this.rateLimitCount,
      avgDurationMs: this.requestCount > 0 ? Math.round(this.totalDurationMs / this.requestCount) : null,
      hasSufficientData: hasData
    };
  }

  public getAIMetrics(): AIMetricsSummary {
    const hasData = this.aiInferencesCount >= 10;
    return {
      totalInferences: this.aiInferencesCount,
      successfulInferences: this.aiSuccessCount,
      failedInferences: this.aiFailCount,
      avgDurationMs: this.aiInferencesCount > 0 ? Math.round(this.aiDurationMs / this.aiInferencesCount) : null,
      hasSufficientData: hasData
    };
  }

  public reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.status2xx = 0;
    this.status4xx = 0;
    this.status5xx = 0;
    this.rateLimitCount = 0;
    this.totalDurationMs = 0;
    this.aiInferencesCount = 0;
    this.aiSuccessCount = 0;
    this.aiFailCount = 0;
    this.aiDurationMs = 0;
  }
}

export const metricsCollector = new OperationalMetricsCollector();
