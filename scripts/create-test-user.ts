import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function createTestUser() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = 'negraodenio@gmail.com';
  // Supabase Auth requires minimum 6 characters for passwords
  const password = '123456'; 

  console.log(`\n👤 Criando usuário de teste: ${email}...`);

  // 1. Garantir que existe um tenant de demonstração
  let tenantId: string;
  const { data: existingTenants, error: tenantQueryErr } = await supabase
    .from('tenants')
    .select('id, name')
    .limit(1);

  if (existingTenants && existingTenants.length > 0) {
    tenantId = existingTenants[0].id;
    console.log(`🏢 Tenant encontrado: "${existingTenants[0].name}" (${tenantId})`);
  } else {
    const { data: newTenant, error: createTenantErr } = await supabase
      .from('tenants')
      .insert({
        name: 'Aegis Demo Enterprise (PT)',
        slug: 'aegis-demo',
        country_code: 'PT',
        vertical: 'generic'
      })
      .select('id')
      .single();

    if (createTenantErr || !newTenant) {
      console.error('❌ Erro ao criar tenant:', createTenantErr);
      return;
    }
    tenantId = newTenant.id;
    console.log(`🏢 Novo tenant criado: ${tenantId}`);
  }

  // 2. Verificar se o usuário já existe no Supabase Auth
  const { data: listUsers } = await supabase.auth.admin.listUsers();
  const existingUser = listUsers?.users?.find(u => u.email === email);

  let userId: string;

  if (existingUser) {
    console.log(`ℹ️  Usuário já existe no Auth (${existingUser.id}). Atualizando senha...`);
    const { data: updatedUser, error: updateErr } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Dénio Negrão', role: 'admin' }
      }
    );
    if (updateErr) {
      console.error('❌ Erro ao atualizar senha:', updateErr);
      return;
    }
    userId = existingUser.id;
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: 'Dénio Negrão', role: 'admin' }
    });

    if (createErr || !newUser.user) {
      console.error('❌ Erro ao criar usuário no Auth:', createErr);
      return;
    }
    userId = newUser.user.id;
    console.log(`✅ Usuário criado no Auth com ID: ${userId}`);
  }

  // 3. Criar ou atualizar perfil na tabela profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        tenant_id: tenantId,
        role: 'admin',
        full_name: 'Dénio Negrão',
        email: email
      });

    if (profileErr) {
      console.error('❌ Erro ao criar perfil:', profileErr);
    } else {
      console.log(`✅ Perfil associado na tabela profiles (Role: admin, Tenant: ${tenantId})`);
    }
  } else {
    await supabase
      .from('profiles')
      .update({
        tenant_id: tenantId,
        role: 'admin',
        full_name: 'Dénio Negrão'
      })
      .eq('id', userId);
    console.log(`✅ Perfil atualizado na tabela profiles (Role: admin)`);
  }

  console.log('\n=========================================');
  console.log('🎉 USUÁRIO DE TESTE PRONTO PARA LOGIN:');
  console.log(`📧 E-mail: ${email}`);
  console.log(`🔑 Senha:  ${password}  (O Supabase exige mínimo de 6 dígitos)`);
  console.log(`🛡️  Role:   admin`);
  console.log('=========================================\n');
}

createTestUser();
