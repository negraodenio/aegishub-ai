-- ==============================================================================
-- AEGISHUB AI — FASE P5.2 WAVE 2 MIGRATION
-- MÓDULO: DEDICATED COGNITIVE SUPPORT KNOWLEDGE BASE (PGVECTOR RAG)
-- DATA: 2026-08-19
-- ==============================================================================

-- 1. Garante que a extensão vector esteja ativa
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Tabela de Chunks de Conhecimento Cognitivo para RAG
CREATE TABLE IF NOT EXISTS public.cognitive_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL = Global
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL UNIQUE,
    embedding vector(1536),
    topic TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('pt', 'en', 'es')),
    evidence_level TEXT NOT NULL CHECK (evidence_level IN ('high_empirical', 'expert_consensus', 'operational_best_practice')),
    clinical_boundary TEXT NOT NULL DEFAULT 'strictly_non_clinical',
    source_type TEXT NOT NULL DEFAULT 'curated_heuristic',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices para Pesquisa Vetorial e Filtros Rápidos
CREATE INDEX IF NOT EXISTS idx_cognitive_knowledge_chunks_topic_lang 
    ON public.cognitive_knowledge_chunks (topic, language);

CREATE INDEX IF NOT EXISTS idx_cognitive_knowledge_chunks_tenant 
    ON public.cognitive_knowledge_chunks (tenant_id);

-- 4. Habilitar RLS
ALTER TABLE public.cognitive_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies Seguras (Zero USING (true))
DROP POLICY IF EXISTS "cognitive_knowledge_chunks_select" ON public.cognitive_knowledge_chunks;
CREATE POLICY "cognitive_knowledge_chunks_select"
    ON public.cognitive_knowledge_chunks
    FOR SELECT
    TO authenticated
    USING (
        clinical_boundary = 'strictly_non_clinical'
        AND (
            tenant_id IS NULL
            OR is_active_tenant_member(auth.uid(), tenant_id)
        )
    );

DROP POLICY IF EXISTS "cognitive_knowledge_chunks_tenant_admin_insert" ON public.cognitive_knowledge_chunks;
CREATE POLICY "cognitive_knowledge_chunks_tenant_admin_insert"
    ON public.cognitive_knowledge_chunks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IS NOT NULL
        AND is_active_tenant_member(auth.uid(), tenant_id)
        AND clinical_boundary = 'strictly_non_clinical'
    );

-- 6. RPC Function para Busca por Similaridade Vetorial Cosine com Filtros
CREATE OR REPLACE FUNCTION match_cognitive_knowledge_chunks (
    query_embedding vector(1536),
    filter_tenant_id uuid default null,
    filter_language text default 'pt',
    filter_topics text[] default null,
    match_threshold float default 0.3,
    match_count int default 3
)
RETURNS TABLE (
    id uuid,
    tenant_id uuid,
    source_id text,
    title text,
    content text,
    topic text,
    language text,
    evidence_level text,
    clinical_boundary text,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ckc.id,
        ckc.tenant_id,
        ckc.source_id,
        ckc.title,
        ckc.content,
        ckc.topic,
        ckc.language,
        ckc.evidence_level,
        ckc.clinical_boundary,
        (CASE 
            WHEN ckc.embedding IS NOT NULL AND query_embedding IS NOT NULL 
            THEN (1 - (ckc.embedding <=> query_embedding))::float 
            ELSE 0.8::float 
         END) AS similarity
    FROM cognitive_knowledge_chunks ckc
    WHERE
        ckc.clinical_boundary = 'strictly_non_clinical'
        AND (ckc.tenant_id IS NULL OR ckc.tenant_id = filter_tenant_id)
        AND (filter_language IS NULL OR ckc.language = filter_language)
        AND (filter_topics IS NULL OR ckc.topic = ANY(filter_topics))
        AND (ckc.embedding IS NULL OR query_embedding IS NULL OR (1 - (ckc.embedding <=> query_embedding)) >= match_threshold)
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- 7. Seeds Iniciais de Conhecimento Curado (TDHA Keep & Reframe)
INSERT INTO public.cognitive_knowledge_chunks (source_id, title, content, content_hash, topic, language, evidence_level, clinical_boundary)
VALUES
    ('TDHA_DEC_01_PT', 'A Regra das 3 Opções', 'Quando confrontado com paralisia de escolha, elimine todas as opções secundárias e reduza o dilema a apenas 3 alternativas. Faça uma escolha binária simples para destravar o início.', 'hash_dec_01_pt', 'decision_simplification', 'pt', 'high_empirical', 'strictly_non_clinical'),
    ('TDHA_DEC_01_EN', 'The Rule of 3 Options', 'When facing choice paralysis, eliminate non-essential options and narrow the dilemma to just 3 items. Make a simple binary choice to trigger task initiation.', 'hash_dec_01_en', 'decision_simplification', 'en', 'high_empirical', 'strictly_non_clinical'),
    ('TDHA_ACT_01_PT', 'O Compromisso dos 2 Minutos', 'O objetivo inicial não é concluir o projeto, mas apenas iniciar a ação física por 120 segundos (ex: abrir o arquivo em branco, digitar o título). O atrito diminui exponencialmente após o primeiro movimento.', 'hash_act_01_pt', 'task_initiation', 'pt', 'high_empirical', 'strictly_non_clinical'),
    ('TDHA_ACT_01_EN', 'The 2-Minute Starting Rule', 'The initial goal is never to finish the entire deliverable, but only to perform the physical starting action for 120 seconds (e.g. open the blank document, write the title).', 'hash_act_01_en', 'task_initiation', 'en', 'high_empirical', 'strictly_non_clinical'),
    ('TDHA_REC_01_PT', 'Âncora de Retomada de Contexto', 'Após uma interrupção ou reunião longa: faça 3 respirações conscientes, leia apenas a última linha concluída e defina 1 verbo de ação imediato para os próximos 5 minutos.', 'hash_rec_01_pt', 'interruption_recovery', 'pt', 'expert_consensus', 'strictly_non_clinical'),
    ('TDHA_REC_01_EN', 'Context Resume Anchor', 'Following an interruption or meeting: take 3 conscious breaths, read only the last completed line, and define a single active verb for the next 5 minutes.', 'hash_rec_01_en', 'interruption_recovery', 'en', 'expert_consensus', 'strictly_non_clinical'),
    ('TDHA_ENE_01_PT', 'Pareamento Energia-Tarefa', 'Quando a energia subjetiva estiver baixa (<=4), execute tarefas de baixo atrito cognitivo (organizar pastas, responder 1 e-mail simples). Reserve planejamento e redação complexa para momentos de energia alta (>=7).', 'hash_ene_01_pt', 'energy_aware_scheduling', 'pt', 'high_empirical', 'strictly_non_clinical'),
    ('TDHA_ENE_01_EN', 'Energy-Task Matching', 'When current subjective energy is low (<=4), tackle low-friction tasks (filing, single quick reply). Reserve deep strategic writing for high energy states (>=7).', 'hash_ene_01_en', 'energy_aware_scheduling', 'en', 'high_empirical', 'strictly_non_clinical'),
    ('TDHA_MEM_01_PT', 'Esvaziamento de Memória de Trabalho', 'A mente humana foi feita para processar ideias, não para retê-las. Escreva todos os itens pendentes em uma lista sem se preocupar com ordem ou formatação antes de selecionar o primeiro passo.', 'hash_mem_01_pt', 'working_memory_offload', 'pt', 'operational_best_practice', 'strictly_non_clinical'),
    ('TDHA_MEM_01_EN', 'Working Memory Dump', 'The human mind is for processing thoughts, not holding them. Dump open loops onto a scrap list without judging the order before picking the single first move.', 'hash_mem_01_en', 'working_memory_offload', 'en', 'operational_best_practice', 'strictly_non_clinical'),
    ('TDHA_FOC_01_PT', 'Micro-Janela de Foco (5 a 10 min)', 'Se 25 minutos parecerem intimidadores, defina uma micro-janela de 5 ou 10 minutos. O compromisso curto desativa o reflexo de procrastinação.', 'hash_foc_01_pt', 'focus_sessions', 'pt', 'operational_best_practice', 'strictly_non_clinical'),
    ('TDHA_FOC_01_EN', 'Micro Focus Window (5 to 10 min)', 'If 25 minutes feels intimidating, set a 5 or 10-minute micro window. The brief commitment deactivates procrastination resistance.', 'hash_foc_01_en', 'focus_sessions', 'en', 'operational_best_practice', 'strictly_non_clinical')
ON CONFLICT (content_hash) DO NOTHING;
