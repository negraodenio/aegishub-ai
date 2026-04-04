-- ============================================================
-- AI GOVERNANCE (AI Act Compliance - Anexo III)
-- Este ficheiro estabelece as estruturas de explicabilidade e 
-- rasto de auditoria ('Human-in-the-Loop') para inferências de IA.
-- ============================================================

-- Ativação da extensão pg_cron para Jobs de Retenção Automática (RGPD)
-- Nota: No Supabase nativo, certifique-se de que a extensão está ativada no Dashboard via Database > Extensions 
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Registo de Decisão Sistémica (Explicação Estruturada)
CREATE TABLE ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Rastreabilidade Origem
  company_id UUID REFERENCES companies(id),
  worker_record_id UUID REFERENCES worker_health_records(id), -- Nullable se não for atado a um health record direto
  
  -- Imutabilidade do Modelo
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  model_used TEXT NOT NULL, -- ex: 'whisper-copsoq-v2.1'
  model_version TEXT NOT NULL,
  
  -- Sinais Clínicos Emitidos
  score NUMERIC,
  vertical TEXT,
  
  -- Explicabilidade Estruturada (Obrigações AI Act)
  decision JSONB, -- O veredito "frio"
  reasons JSONB,  -- Array de Reason (code, confidence, evidence)
  recommendation JSONB, -- A sugestão de próxima ação
  
  -- Nível de Risco & Intervenção
  risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  requires_human_review BOOLEAN DEFAULT TRUE,
  
  -- Feedback Loop Analítico (Supervisão Humana & Auto-Otimização M2.7)
  human_validated BOOLEAN,
  human_action TEXT, -- 'approved' | 'rejected' | 'adjusted'
  human_feedback TEXT,
  memory_updates JSONB -- Estado persistido da LLM (Scaffolding adjustments)
);

-- 2. Ledger Imutável de Auditoria (Quem fez o quê e quando)
CREATE TABLE ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
  
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  action TEXT NOT NULL, -- 'created' | 'validated' | 'rejected' | 'updated' | 'self_optimized'
  actor TEXT NOT NULL,  -- 'system' | 'human: dpo_id' | 'm2.7_loop'
  
  details JSONB,
  old_memory JSONB,
  new_memory JSONB,
  scaffold_changes JSONB
);

-- 3. Empreendedorismo de Retenção de Dados (RGPD - Apagar Voice Records passados 12 meses)
CREATE TABLE data_retention_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  
  table_name TEXT,
  records_deleted INTEGER,
  
  policy TEXT,
  status TEXT
);

-- ============================================================
-- JOB CRON (PostgreSQL): Limpeza RGPD Inteligente
-- ============================================================
-- Agenda o apagamento físico de tokens/hashes e de registros seletivos (áudio já é descartado).
-- Remove dados antigos do worker_health_record que já não sirvam.

-- (Nota: Para não quebrar o preview local que não tenha acesso ao pg_cron como super_user, 
-- esta execução cron é omitida num bypass seguro. Rodar em Produção Dashboard)
DO $$
BEGIN
  IF exists (SELECT * FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'delete_old_voice_metadata',
      '0 3 * * *',
      'DELETE FROM worker_health_records WHERE created_at < NOW() - INTERVAL ''12 months''; 
       INSERT INTO data_retention_jobs (table_name, policy, status) VALUES (''worker_health_records'', ''12 months RGPD cleanup'', ''executed'');'
    );
  END IF;
END $$;
