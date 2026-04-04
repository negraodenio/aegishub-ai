import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function applySOSSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const sql = `
    -- 1. Sessões de SOS (Emergência)
    CREATE TABLE IF NOT EXISTS sos_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'escalated', 'resolved'
      risk_level TEXT DEFAULT 'unknown',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2. Mensagens do SOS Chat
    CREATE TABLE IF NOT EXISTS sos_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sos_sessions(id) ON DELETE CASCADE,
      sender_role TEXT NOT NULL, -- 'ai', 'employee', 'human'
      content TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 3. Inserir log de auditoria
    INSERT INTO ai_audit_logs (tenant_id, action, status, details) 
    VALUES (null, 'schema_deployment_sos_chat', 'success', '{"version": "1.0.0"}')
    ON CONFLICT DO NOTHING;
  `;

  console.log('🚀 Implementando Infraestrutura de SOS Chat...');
  // Tentar rodar via RPC se existir, senão avisar
  const { error } = await supabase.rpc('execute_sql', { sql });

  if (error) {
    console.error('❌ Erro de banco de dados:', error);
    process.exit(1);
  } else {
    console.log('✅ Infraestrutura SOS Pronta!');
    process.exit(0);
  }
}

applySOSSchema();
