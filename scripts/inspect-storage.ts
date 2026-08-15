import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function inspectStorage() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  console.log('\n📦 INSPEÇÃO DE STORAGE NO SUPABASE (' + SUPABASE_URL + '):\n');

  // 1. Listar buckets
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  
  if (listErr) {
    console.error('❌ Erro ao listar buckets:', listErr);
    return;
  }

  console.log('Total de buckets encontrados:', buckets.length);
  buckets.forEach((b, idx) => {
    console.log(`\n${idx + 1}. Bucket ID: "${b.id}" | Nome: "${b.name}"`);
    console.log(`   - Público: ${b.public}`);
    console.log(`   - Criado em: ${b.created_at}`);
    console.log(`   - Limite de tamanho: ${b.file_size_limit ? b.file_size_limit / (1024 * 1024) + ' MB' : 'Sem limite explícito'}`);
    console.log(`   - MIME types permitidos: ${b.allowed_mime_types ? b.allowed_mime_types.join(', ') : 'Todos'}`);
  });

  // 2. Testar upload e download direto no bucket voice-assessments
  console.log('\n🧪 Testando upload/download no bucket "voice-assessments"...');
  const testBuffer = Buffer.from('test-audio-content');
  const testFileName = `test-healthcheck-${Date.now()}.txt`;
  
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('voice-assessments')
    .upload(testFileName, testBuffer, { contentType: 'text/plain', upsert: true });

  if (uploadErr) {
    console.error('❌ Erro no teste de upload:', uploadErr.message);
  } else {
    console.log('✅ Upload de teste realizado com sucesso! Path:', uploadData.path);
    
    // Gerar URL pública
    const { data: publicUrlData } = supabase.storage
      .from('voice-assessments')
      .getPublicUrl(uploadData.path);
    console.log('🔗 URL pública do arquivo de teste:', publicUrlData.publicUrl);

    // Limpar arquivo de teste
    await supabase.storage.from('voice-assessments').remove([uploadData.path]);
    console.log('🧹 Arquivo de teste removido.');
  }

  console.log('\n=========================================');
  console.log('STATUS: Bucket voice-assessments operacional!');
  console.log('=========================================\n');
}

inspectStorage();
