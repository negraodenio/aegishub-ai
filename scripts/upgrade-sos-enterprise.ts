import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function upgradeSOSEnterprise() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const sql = `
    -- 1. Evolução das Sessões de SOS
    ALTER TABLE sos_sessions 
    ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

    -- 2. Evolução das Mensagens (Audit Trail Sênior)
    ALTER TABLE sos_messages 
    ADD COLUMN IF NOT EXISTS risk_score FLOAT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS intent_label TEXT DEFAULT 'neutral',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

    -- 3. Evolução dos Referrals (Gestão de SLA)
    ALTER TABLE care_referrals 
    ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sos_sessions(id),
    ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS assigned_officer UUID REFERENCES profiles(id);

    -- 4. Registrar Audit Log de Upgrade
    INSERT INTO ai_audit_logs (action, actor, status, details) 
    VALUES ('enterprise_sos_upgrade', 'system', 'success', '{"version": "2.0.0", "engine": "semantic_triage"}')
    ON CONFLICT DO NOTHING;
  `;

  console.log('🚀 Elevando SOS para Nível Enterprise (V2)...');
  const { error } = await supabase.rpc('execute_sql', { sql });

  if (error) {
    console.error('❌ Erro no upgrade do banco:', error);
    process.exit(1);
  } else {
    console.log('✅ Infraestrutura SOS Enterprise Ativa!');
    process.exit(0);
  }
}

upgradeSOSEnterprise();
