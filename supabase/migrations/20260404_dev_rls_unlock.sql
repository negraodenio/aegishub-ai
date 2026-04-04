-- 🔓 MIND OPS DEV PRIVILEGE ESCALATION
-- Purpose: Temporarily allow assessment access without full session (for testing)

-- 1. Permissões de Leitura (Garantir que o link /assessment finalize)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- 2. Permissões de Escrita (Garantir que o submit funcione)
ALTER TABLE assessment_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores DISABLE ROW LEVEL SECURITY;

-- 🎙️ Nota: Em produção, o RLS deve ser reativado e configurado por Tenant.
