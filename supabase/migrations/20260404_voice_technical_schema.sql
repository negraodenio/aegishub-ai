-- 🎙️ Biofonia Compliance 2.0 (AI Act & Lei 102/2009)
-- Foco: Indicadores Técnicos de Fadiga Vocal Ocupacional

CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL DEFAULT 'guided_reading',
  language TEXT NOT NULL DEFAULT 'pt-PT',
  sample_rate INTEGER,
  duration_ms INTEGER,
  audio_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Features acústicas extraídas (ex: openSMILE eGeMAPS)
CREATE TABLE IF NOT EXISTS voice_features (
  session_id UUID PRIMARY KEY REFERENCES voice_sessions(id) ON DELETE CASCADE,
  feature_set_version TEXT NOT NULL,
  f0_mean NUMERIC,
  jitter_local NUMERIC,
  shimmer_local NUMERIC,
  hnr_mean NUMERIC,
  speech_rate NUMERIC,
  pause_ratio NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scores de fadiga e carga vocal (XGBoost Regressor)
CREATE TABLE IF NOT EXISTS voice_scores (
  session_id UUID PRIMARY KEY REFERENCES voice_sessions(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  vocal_load_score NUMERIC CHECK (vocal_load_score >= 0 AND vocal_load_score <= 100),
  confidence_score NUMERIC,
  top_factors JSONB DEFAULT '[]'::jsonb,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'rejected', 'escalated')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trilha de Auditoria Técnica
CREATE TABLE IF NOT EXISTS voice_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  details_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para Performance de Dashboard
CREATE INDEX IF NOT EXISTS idx_voice_sessions_employee ON voice_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_tenant ON voice_sessions(tenant_id);
