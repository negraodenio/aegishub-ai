import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const migrationPath = path.join(
  process.cwd(),
  'supabase', 'migrations', '20260815_remediation_v1.sql'
);

async function applyMigration() {
  console.log('🚀 AegisHub Database Remediation v1.0.0');
  console.log('📍 Target:', SUPABASE_URL);
  console.log('📄 Migration:', migrationPath);
  console.log('');

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split SQL into individual statements for execution
  // Remove comments and split by semicolons
  const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10); // filter empty/whitespace

  console.log(`📊 ${statements.length} statements to execute`);

  // Use pg via Supabase REST API for DDL
  // Since supabase-js doesn't support raw DDL, use the Management API
  const projectRef = 'hffdgtldtjflkozeavoi';
  
  // Use fetch to call Supabase's SQL API endpoint directly
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/execute_migration`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql_content: sql })
    }
  );

  if (!response.ok) {
    // Try the Supabase Management API instead
    console.log('ℹ️  Direct RPC not available. Using Management API...');
    
    const mgmtResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      }
    );

    const mgmtResult = await mgmtResponse.json();
    
    if (!mgmtResponse.ok) {
      console.error('❌ Management API error:', mgmtResult);
      // Fall back to applying via supabase client blocks
      await applyViaBlocks(sql);
      return;
    }
    
    console.log('✅ Migration applied via Management API:', mgmtResult);
    return;
  }

  console.log('✅ Migration applied successfully');
}

async function applyViaBlocks(fullSql: string) {
  console.log('');
  console.log('🔄 Applying migration block-by-block via service role...');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // Block 1: assessment_scores columns
  const block1 = `
    ALTER TABLE public.assessment_scores
      ADD COLUMN IF NOT EXISTS phq9_score NUMERIC,
      ADD COLUMN IF NOT EXISTS gad7_score NUMERIC,
      ADD COLUMN IF NOT EXISTS burnout_score NUMERIC,
      ADD COLUMN IF NOT EXISTS wellbeing_score NUMERIC,
      ADD COLUMN IF NOT EXISTS psychosocial_risk_score NUMERIC,
      ADD COLUMN IF NOT EXISTS voice_signal_score NUMERIC,
      ADD COLUMN IF NOT EXISTS voice_path TEXT
  `;

  // Block 2: manager_dashboard_aggregates columns
  const block2 = `
    ALTER TABLE public.manager_dashboard_aggregates
      ADD COLUMN IF NOT EXISTS org_unit_id UUID,
      ADD COLUMN IF NOT EXISTS low_risk_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS moderate_risk_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS high_risk_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS critical_risk_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS avg_composite_score NUMERIC,
      ADD COLUMN IF NOT EXISTS open_alerts_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS open_referrals_count INTEGER NOT NULL DEFAULT 0
  `;

  // Block 3: risk_alerts requires_human_review
  const block3 = `
    ALTER TABLE public.risk_alerts
      ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN NOT NULL DEFAULT true
  `;

  const blocks = [
    { name: 'assessment_scores sub-scores + voice_path', sql: block1 },
    { name: 'manager_dashboard_aggregates 8 columns', sql: block2 },
    { name: 'risk_alerts requires_human_review', sql: block3 },
  ];

  for (const block of blocks) {
    const { error } = await (supabase as any).rpc('pg_query', { query: block.sql });
    if (error) {
      // supabase-js doesn't support DDL via rpc — expected
      console.log(`⚠️  Block "${block.name}" needs manual execution (DDL not supported via JS client)`);
    } else {
      console.log(`✅ Block "${block.name}" applied`);
    }
  }

  console.log('');
  console.log('📋 INSTRUÇÕES FINAIS:');
  console.log('=========================================');
  console.log('A migration foi preparada. Como o Supabase JS client não suporta DDL via REST,');
  console.log('copie e execute o SQL no Supabase Dashboard → SQL Editor:');
  console.log('');
  console.log('URL: https://supabase.com/dashboard/project/hffdgtldtjflkozeavoi/sql/new');
  console.log('');
  console.log('O SQL já está em: supabase/migrations/20260815_remediation_v1.sql');
  console.log('=========================================');
}

applyMigration().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
