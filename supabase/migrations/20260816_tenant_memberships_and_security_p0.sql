-- ============================================================================
-- Migration: 20260816_tenant_memberships_and_security_p0.sql
-- Description: Implement tenant_memberships table, backfill from profiles,
-- update current_tenant_id() and current_user_role() to be membership-aware,
-- and add strict RLS policies.
-- ============================================================================

BEGIN;

-- 1. Garantir que o tipo enum ou constraint de user_role exista
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM (
      'admin',
      'rh',
      'manager',
      'sst_professional',
      'health_professional',
      'employee',
      'dpo',
      'auditor'
    );
  END IF;
END $$;

-- 2. Create tenant_memberships table (usando TEXT para compatibilidade direta com profiles)
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'rh', 'manager', 'sst_professional', 'health_professional', 'employee', 'dpo', 'auditor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Indices for rapid lookup by user and tenant
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON public.tenant_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id, status);

-- 3. Backfill existing profiles into tenant_memberships
INSERT INTO public.tenant_memberships (user_id, tenant_id, role, status)
SELECT 
  p.id AS user_id,
  p.tenant_id,
  p.role,
  'active' AS status
FROM public.profiles p
WHERE p.tenant_id IS NOT NULL
ON CONFLICT (user_id, tenant_id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = now();

-- 4. Enable RLS on tenant_memberships
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memberships_select_own" ON public.tenant_memberships;
CREATE POLICY "memberships_select_own" ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "memberships_admin_all" ON public.tenant_memberships;
CREATE POLICY "memberships_admin_all" ON public.tenant_memberships
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = public.tenant_memberships.tenant_id
        AND tm.role = 'admin'
        AND tm.status = 'active'
    )
  );

-- 5. Update current_tenant_id() to be membership-aware with search_path safety
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT COALESCE(
    -- 1. Try active membership in tenant_memberships
    (SELECT tm.tenant_id 
     FROM public.tenant_memberships tm 
     WHERE tm.user_id = auth.uid() 
       AND tm.status = 'active' 
     ORDER BY tm.created_at ASC 
     LIMIT 1),
    -- 2. Fallback to profile tenant_id for backward compatibility
    (SELECT p.tenant_id 
     FROM public.profiles p 
     WHERE p.id = auth.uid())
  );
$$;

COMMENT ON FUNCTION public.current_tenant_id() IS 'Retorna tenant_id do utilizador autenticado a partir de tenant_memberships ou fallback de profile. SECURITY DEFINER com search_path fixo.';

-- 6. Update current_user_role() to be membership-aware with search_path safety
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT COALESCE(
    -- 1. Try active membership in tenant_memberships
    (SELECT tm.role 
     FROM public.tenant_memberships tm 
     WHERE tm.user_id = auth.uid() 
       AND tm.status = 'active' 
     ORDER BY tm.created_at ASC 
     LIMIT 1),
    -- 2. Fallback to profile role
    (SELECT p.role 
     FROM public.profiles p 
     WHERE p.id = auth.uid()),
    'employee'
  );
$$;

COMMENT ON FUNCTION public.current_user_role() IS 'Retorna role do utilizador autenticado no tenant ativo. SECURITY DEFINER com search_path fixo.';

COMMIT;
