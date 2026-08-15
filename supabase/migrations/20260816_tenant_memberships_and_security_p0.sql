-- ============================================================================
-- Migration: 20260816_tenant_memberships_and_security_p0.sql
-- Description: Implement tenant_memberships table, backfill from profiles,
-- update current_tenant_id() and current_user_role() to be membership-aware,
-- and add strict RLS policies.
-- ============================================================================

BEGIN;

-- 1. Create tenant_memberships table
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'employee',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Indices for rapid lookup by user and tenant
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON public.tenant_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id, status);

-- 2. Backfill existing profiles into tenant_memberships
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

-- 3. Enable RLS on tenant_memberships
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

-- 4. Update current_tenant_id() to be membership-aware with search_path safety
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
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
    -- 2. Fallback to profile tenant_id for backwards compatibility
    (SELECT p.tenant_id 
     FROM public.profiles p 
     WHERE p.id = auth.uid())
  );
$$;

COMMENT ON FUNCTION public.current_tenant_id() IS 'Retorna tenant_id ativo do utilizador autenticado via memberships. SECURITY DEFINER com search_path fixo.';

-- 5. Update current_user_role() to be membership-aware
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
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
    'employee'::public.user_role
  );
$$;

COMMENT ON FUNCTION public.current_user_role() IS 'Retorna role do utilizador autenticado no tenant ativo. SECURITY DEFINER com search_path fixo.';

COMMIT;
