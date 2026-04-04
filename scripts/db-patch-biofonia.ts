import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function applyFinalPatch() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const sql = `
    -- 1. Garantir coluna de voz nos scores
    ALTER TABLE IF EXISTS assessment_scores ADD COLUMN IF NOT EXISTS voice_path TEXT;

    -- 2. Garantir tabela técnica de biofonia
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

    -- 3. Inserir um log de auditoria do patch
    INSERT INTO ai_audit_logs (tenant_id, action, status, details) 
    VALUES (null, 'db_patch_biofonia_2_0', 'success', '{"applied": true}')
    ON CONFLICT DO NOTHING;
  `;

  console.log('🚀 Aplicando Patch de Biofonia 2.0...');
  const { error } = await supabase.rpc('execute_sql', { sql });

  if (error) {
    console.error('❌ Erro ao aplicar patch:', error);
    process.exit(1);
  } else {
    console.log('✅ Banco de Dados Atualizado com Sucesso!');
    process.exit(0);
  }
}

applyFinalPatch();
