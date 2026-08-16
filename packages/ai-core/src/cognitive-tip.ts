/**
 * 💡 CognitiveTipManager: Gestor de Dicas Diárias de Acessibilidade Cognitiva & Produtividade
 * - Cache estrito em memória de 24 horas por idioma
 * - Zero PII no cache
 * - Prompts 100% neutros e focados em apoio executivo/funcional (sem termos clínicos)
 */

interface TipCacheEntry {
  tip: string;
  cachedAt: number;
}

const DEFAULT_TIPS_BY_LANG: Record<string, string[]> = {
  pt: [
    "Divida a tarefa mais complexa do seu dia em 3 blocos de 10 minutos. O primeiro passo é apenas abrir o arquivo.",
    "Quando sentir que a atenção está oscilando, faça uma pausa ativa de 3 minutos longe de telas.",
    "Priorize apenas 1 vitória indispensável para hoje. Concluir o essencial traz clareza para o restante.",
    "Começar pelo passo menor reduz a resistência inicial. Uma ação simples desbloqueia o ritmo de trabalho.",
    "Organize seu ambiente visual de trabalho: feche abas desnecessárias antes de iniciar seu bloco de foco."
  ],
  en: [
    "Break down your most complex task into three 10-minute focus windows. Starting small builds momentum.",
    "When focus starts to drift, take a 3-minute screen-free break to reset your working memory.",
    "Select only 1 essential daily win. Completing the core priority creates clarity for everything else.",
    "A 5-minute honest start is better than waiting for perfect conditions.",
    "Clear visual clutter from your digital workspace before entering a focused work block."
  ]
};

export class CognitiveTipManager {
  private cache: Map<string, TipCacheEntry> = new Map();
  private readonly ttlMs: number;

  constructor(ttlHours: number = 24) {
    this.ttlMs = ttlHours * 60 * 60 * 1000;
  }

  /**
   * Obtém chave do cache baseada no dia UTC e idioma
   */
  private getCacheKey(language: string): string {
    const today = new Date().toISOString().split("T")[0];
    return `${today}_${language.toLowerCase()}`;
  }

  /**
   * Retorna a dica do cache se válida
   */
  public getCachedTip(language: string = "pt"): string | null {
    const key = this.getCacheKey(language);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.cachedAt > this.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.tip;
  }

  /**
   * Armazena a dica no cache
   */
  public setCachedTip(tip: string, language: string = "pt"): void {
    const key = this.getCacheKey(language);
    this.cache.set(key, {
      tip,
      cachedAt: Date.now()
    });
  }

  /**
   * Gera uma dica de fallback segura e neutra
   */
  public getFallbackTip(language: string = "pt"): string {
    const langKey = language.toLowerCase().startsWith("pt") ? "pt" : "en";
    const tips = DEFAULT_TIPS_BY_LANG[langKey] ?? DEFAULT_TIPS_BY_LANG["pt"] ?? [
      "Divida a tarefa mais complexa do seu dia em 3 blocos de 10 minutos. O primeiro passo é apenas abrir o arquivo."
    ];
    const index = Math.floor(Math.random() * tips.length);
    return tips[index] ?? tips[0] ?? "Uma ação simples desbloqueia o ritmo de trabalho.";
  }

  /**
   * Retorna o prompt neutro para geração de dicas via LLM
   */
  public getNeutralTipPrompt(language: string = "pt"): { systemPrompt: string; userPrompt: string } {
    const isPt = language.toLowerCase().startsWith("pt");
    
    const systemPrompt = isPt
      ? `Você é um assistente corporativo de produtividade e suporte executivo no trabalho.
Sua função é fornecer uma única dica prática, objetiva e encorajadora para ajudar profissionais a organizarem seu tempo e reduzirem o atrito ao iniciar tarefas complexas.
Regras Absolutas de Segurança:
- Não faça menção a termos médicos, clínicos, transtornos, diagnósticos ou condições de saúde mental.
- Responda apenas com a dica em 1 ou 2 frases curtas.`
      : `You are an executive productivity and workplace support assistant.
Your goal is to provide a single, actionable, and encouraging tip to help busy professionals organize their time and reduce friction when starting complex work.
Absolute Safety Rules:
- Never mention medical, clinical, psychological terms, diagnoses, or mental health conditions.
- Output only the single practical tip in 1 or 2 brief sentences.`;

    const userPrompt = isPt
      ? "Gere uma dica prática e objetiva de suporte ao foco e organização de trabalho para hoje."
      : "Provide one practical, concise tip for focus and task organization for today.";

    return { systemPrompt, userPrompt };
  }
}
