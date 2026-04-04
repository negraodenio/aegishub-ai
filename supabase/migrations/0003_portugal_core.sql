-- ============================================================
-- CORE: EMPRESAS E COMPLIANCE PORTUGAL
-- ============================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nif VARCHAR(9) UNIQUE NOT NULL, 
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    size_category VARCHAR(20) CHECK (size_category IN ('micro', 'pequena', 'media', 'grande')),
    total_employees INTEGER NOT NULL,
    act_code VARCHAR(20), 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    gdpr_dpo_name VARCHAR(255),
    gdpr_dpo_email VARCHAR(255),
    gdpr_dpo_phone VARCHAR(20),
    ai_act_registered BOOLEAN DEFAULT FALSE,
    eu_ai_database_id VARCHAR(100)
);

-- ============================================================
-- RGPD: CONSENTIMENTOS E PRIVACIDADE (ART. 9º)
-- ============================================================

CREATE TABLE worker_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    category_code VARCHAR(50) NOT NULL, -- 'COPSOQ_ASSESSMENT', 'VOICE_ANALYSIS', 'CLINICAL_SCREENING'
    status VARCHAR(20) DEFAULT 'pending', -- 'granted', 'withdrawn', 'expired'
    granted_at TIMESTAMPTZ,
    valid_until DATE,
    consent_hash VARCHAR(64), -- SHA-256 integridade
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gdpr_dpia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    data_types TEXT[], 
    risks_identified JSONB,
    mitigation_measures JSONB,
    residual_risk_level VARCHAR(10),
    approved_by_dpo BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    next_review_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COPSOQ-II: INSTRUMENTO VALIDADO PT-PT
-- ============================================================

CREATE TABLE copsoq_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assessment_type VARCHAR(20) DEFAULT 'full',
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    scores JSONB DEFAULT '{}'::jsonb, -- Percentis 40/60 calculados
    overall_risk_level VARCHAR(10) DEFAULT 'medio',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI ACT: GOVERNANCE E AUDITABILIDADE
-- ============================================================

CREATE TABLE ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    decision_id VARCHAR(100) UNIQUE NOT NULL,
    operation_type VARCHAR(50), -- 'inference', 'training', 'override'
    input_data_hash VARCHAR(64),
    output_data_hash VARCHAR(64),
    model_version VARCHAR(50) NOT NULL,
    human_in_the_loop BOOLEAN DEFAULT FALSE,
    human_supervisor_id UUID, -- Referência a user/health_professional
    human_override_reason TEXT,
    processing_context JSONB,
    retention_until TIMESTAMPTZ, -- 6 anos AI Act
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRONTUÁRIO INTEGRADO (WORKER HEALTH RECORD)
-- ============================================================

CREATE TABLE worker_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    record_code VARCHAR(50) UNIQUE NOT NULL,
    multimodal_risk_score DECIMAL(5,2),
    risk_trend VARCHAR(20) DEFAULT 'stable', -- 'improving', 'stable', 'worsening'
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    access_log JSONB DEFAULT '[]'::jsonb
);

-- ============================================================
-- REDE SNS: REFERRAL E PROFISSIONAIS
-- ============================================================

CREATE TABLE health_professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL, 
    professional_type VARCHAR(20), -- 'psicologo', 'medico_trabalho'
    license_entity VARCHAR(10), -- 'OPP', 'OM'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
