import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAndCreateBucket() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 Verificando bucket voice-assessments...');
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  
  if (listErr) {
    console.error('❌ Erro ao listar buckets:', listErr);
    return;
  }

  console.log('📦 Buckets existentes:', buckets.map(b => b.name));

  const voiceBucket = buckets.find(b => b.id === 'voice-assessments' || b.name === 'voice-assessments');
  
  if (!voiceBucket) {
    console.log('⚙️  Criando bucket "voice-assessments"...');
    const { data: newBucket, error: createErr } = await supabase.storage.createBucket('voice-assessments', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });

    if (createErr) {
      console.error('❌ Erro ao criar bucket:', createErr);
    } else {
      console.log('✅ Bucket "voice-assessments" criado com sucesso!');
    }
  } else {
    console.log('✅ Bucket "voice-assessments" já existe. Garantindo permissões públicas...');
    await supabase.storage.updateBucket('voice-assessments', {
      public: true,
      fileSizeLimit: 10485760
    });
    console.log('✅ Bucket atualizado com sucesso!');
  }
}

checkAndCreateBucket();
