const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function list() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('ERROR:', error);
    return;
  }
  console.log('--- SUPABASE USERS LIST ---');
  data.users.forEach(u => {
    console.log(`Email: ${u.email} | Created: ${u.created_at} | Last Sign In: ${u.last_sign_in_at}`);
  });
  console.log('---------------------------');
}

list();
