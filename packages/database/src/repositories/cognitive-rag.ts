import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../generated.types";

export type IdentifiedBarrier =
  | "overwhelm"
  | "distraction"
  | "low_energy"
  | "decision_fatigue"
  | "context_loss"
  | null;

export interface MatchedKnowledgeResult {
  id: string;
  topic: string;
  title: string;
  content: string;
  strategyCode: string;
  evidenceLevel: "high_empirical" | "expert_consensus" | "operational_best_practice";
  language: "pt" | "en";
  clinicalBoundary: "strictly_non_clinical";
  similarity?: number | undefined;
}

export interface SearchCognitiveKnowledgeOptions {
  tenantId?: string | null;
  barrier?: IdentifiedBarrier;
  language?: string;
  limit?: number;
  threshold?: number;
}

function getTopicsForBarrier(barrier: IdentifiedBarrier): string[] {
  switch (barrier) {
    case "decision_fatigue":
      return ["decision_simplification", "task_initiation"];
    case "context_loss":
      return ["interruption_recovery", "working_memory_offload"];
    case "overwhelm":
      return ["working_memory_offload", "task_initiation", "decision_simplification"];
    case "low_energy":
      return ["energy_aware_scheduling", "focus_sessions", "task_initiation"];
    case "distraction":
      return ["focus_sessions", "interruption_recovery"];
    default:
      return ["task_initiation", "focus_sessions"];
  }
}

/**
 * 🔍 Busca semântica real no pgvector via RPC `match_cognitive_knowledge_chunks`
 * com fallback gracioso para a base curada em memória se o banco ou RPC estiver indisponível.
 */
export async function searchCognitiveKnowledge(
  client: SupabaseClient<Database>,
  queryEmbedding: number[],
  options: SearchCognitiveKnowledgeOptions = {}
): Promise<MatchedKnowledgeResult[]> {
  const language = options.language || "pt";
  const normLang = String(language).toLowerCase().startsWith("pt") ? "pt" : "en";
  const limit = Math.min(3, Math.max(1, options.limit || 2));
  const barrier = options.barrier ?? null;
  const topics = barrier ? getTopicsForBarrier(barrier) : null;
  const tenantId = options.tenantId || null;

  try {
    const { data, error } = await (client.rpc as any)("match_cognitive_knowledge_chunks", {
      query_embedding: queryEmbedding,
      filter_tenant_id: tenantId,
      filter_language: normLang,
      filter_topics: topics,
      match_threshold: options.threshold ?? 0.25,
      match_count: limit
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        topic: row.topic,
        title: row.title,
        content: row.content,
        strategyCode: row.source_id || "DB_CHUNK",
        evidenceLevel: row.evidence_level || "high_empirical",
        language: row.language,
        clinicalBoundary: "strictly_non_clinical" as const,
        similarity: row.similarity
      }));
    }
  } catch {
    // Graceful fallback on RPC/network failure
  }

  // Fallback estático seguro em caso de indisponibilidade de banco/rede
  return [
    {
      id: "kb_fallback_init",
      topic: "task_initiation",
      title: normLang === "pt" ? "O Compromisso dos 2 Minutos" : "The 2-Minute Starting Rule",
      content: normLang === "pt"
        ? "Inicie a ação física por 120 segundos para diminuir a resistência inicial."
        : "Start the physical action for 120 seconds to reduce initial friction.",
      strategyCode: "TWO_MINUTE_INITIATION",
      evidenceLevel: "high_empirical",
      language: normLang,
      clinicalBoundary: "strictly_non_clinical" as const,
      similarity: 0.85
    }
  ];
}

/**
 * Insere um chunk de conhecimento específico do tenant (ex: SOPs, manuais de foco internos)
 */
export async function insertTenantCognitiveKnowledgeChunk(
  client: SupabaseClient<Database>,
  params: {
    tenantId: string;
    sourceId: string;
    title: string;
    content: string;
    contentHash: string;
    embedding?: number[];
    topic: string;
    language: "pt" | "en" | "es";
    evidenceLevel: "high_empirical" | "expert_consensus" | "operational_best_practice";
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Prevenção de segurança: bloqueia conteúdo clínico
  const lower = (params.title + " " + params.content).toLowerCase();
  const forbidden = ["diagnóstico", "tdah", "autismo", "medicamento", "remédio", "prescrição"];
  if (forbidden.some((w) => lower.includes(w))) {
    return { success: false, error: "CLINICAL_CONTENT_FORBIDDEN" };
  }

  try {
    const { data, error } = await (client.from("cognitive_knowledge_chunks") as any)
      .insert({
        tenant_id: params.tenantId,
        source_id: params.sourceId,
        title: params.title,
        content: params.content,
        content_hash: params.contentHash,
        embedding: params.embedding || null,
        topic: params.topic,
        language: params.language,
        evidence_level: params.evidenceLevel,
        clinical_boundary: "strictly_non_clinical",
        source_type: "tenant_sop"
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message || "INSERT_FAILED" };
  }
}
