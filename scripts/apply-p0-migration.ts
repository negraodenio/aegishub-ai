import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('🚀 Executando validação e aplicação do P0 Schema...');
  console.log('📍 Endpoint:', SUPABASE_URL);

  // Check if tenant_memberships already exists or create via RPC/REST
  const { data, error } = await supabase.from('tenant_memberships').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.log('⚠️ Tabela tenant_memberships ainda não existe na base remota.');
    console.log('📋 Execute o arquivo supabase/migrations/20260816_tenant_memberships_and_security_p0.sql no Supabase SQL Editor ou via Management API.');
  } else if (!error) {
    console.log('✅ Tabela tenant_memberships detectada no banco!');
  } else {
    console.log('ℹ️ Status de verificação:', error.message);
  }
}

main().catch(console.error);
