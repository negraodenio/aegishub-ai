-- Migration: 20260818_llm_guard_atomic_lease.sql
-- Description: Adds an atomic server-side RPC to acquire an LLM lease, preventing concurrent quota overflow.

CREATE OR REPLACE FUNCTION acquire_llm_lease(
    p_user_id UUID,
    p_tenant_id UUID,
    p_estimated_cost NUMERIC,
    p_max_daily_cost NUMERIC
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_success BOOLEAN := FALSE;
BEGIN
    -- Attempt to insert a new row for today or update the existing one atomically
    INSERT INTO llm_usage_leases (
        user_id,
        tenant_id,
        date,
        daily_tokens_used,
        daily_cost_usd,
        updated_at
    )
    VALUES (
        p_user_id,
        p_tenant_id,
        v_today,
        0, -- Tokens are updated in reconcile
        p_estimated_cost,
        NOW()
    )
    ON CONFLICT (user_id, date) DO UPDATE
    SET 
        daily_cost_usd = llm_usage_leases.daily_cost_usd + EXCLUDED.daily_cost_usd,
        updated_at = NOW()
    WHERE llm_usage_leases.daily_cost_usd + EXCLUDED.daily_cost_usd <= p_max_daily_cost
    RETURNING TRUE INTO v_success;

    -- If v_success is NULL (or false), it means the WHERE condition blocked the update (Quota exceeded)
    -- OR it successfully inserted (which also returns TRUE into v_success)
    RETURN COALESCE(v_success, FALSE);
END;
$$;
