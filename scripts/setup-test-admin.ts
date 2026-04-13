import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar .env da raiz
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  const email = 'admin@aegis.pt';
  const password = 'Aegis2026!';

  console.log(`🚀 Criando/Atualizando utilizador: ${email}...`);

  // 1. Tentar criar o utilizador via Admin API (ignora confirmação de email)
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { 
      full_name: 'Administrador AEGIS',
      role: 'manager'
    }
  });

  if (createError) {
    if (createError.message.includes('already registered')) {
      console.log("ℹ️ Utilizador já existe. A atualizar palavra-passe e metadados...");
      
      // Se já existe, vamos apenas atualizar para garantir que a PW é a que definimos
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users.find(u => u.email === email);
      
      if (existingUser) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: password,
          user_metadata: { 
            full_name: 'Administrador AEGIS',
            role: 'manager'
          }
        });
        if (updateError) {
          console.error("❌ Erro ao atualizar utilizador:", updateError.message);
          return;
        }
        console.log("✅ Utilizador atualizado com sucesso.");
      }
    } else {
      console.error("❌ Erro ao criar utilizador:", createError.message);
      return;
    }
  } else {
    console.log(`✅ Utilizador criado com sucesso: ${user.user?.id}`);
  }

  console.log("\n--- CREDENCIAIS DE TESTE ---");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("----------------------------");
}

setupAdmin();
