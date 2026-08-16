-- ==============================================================================
-- AEGISHUB AI — FASE P6.1 SECURITY HARDENING MIGRATION
-- MÓDULO: SECURITY DEFINER LEAST PRIVILEGE & ACCESS RESTRICTION
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. HARDENING DE record_llm_usage: REVOGAR PERMISSÃO DE EXECUÇÃO PÚBLICA/ANÔNIMA
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'record_llm_usage'
    ) THEN
        REVOKE ALL ON FUNCTION public.record_llm_usage(UUID, UUID, INTEGER, NUMERIC) FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.record_llm_usage(UUID, UUID, INTEGER, NUMERIC) FROM anon;
        GRANT EXECUTE ON FUNCTION public.record_llm_usage(UUID, UUID, INTEGER, NUMERIC) TO authenticated;
        GRANT EXECUTE ON FUNCTION public.record_llm_usage(UUID, UUID, INTEGER, NUMERIC) TO service_role;
    END IF;
END $$;

COMMENT ON FUNCTION public.record_llm_usage(UUID, UUID, INTEGER, NUMERIC) IS 
'Registra consumo de cotas de LLM com isolamento atômico. Restrito estritamente a utilizadores autenticados e service_role.';

-- 2. HARDENING DE complete_clinical_assessment: GARANTIR EXECUÇÃO RESTRITA A AUTHENTICATED
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'complete_clinical_assessment'
    ) THEN
        REVOKE ALL ON FUNCTION public.complete_clinical_assessment FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.complete_clinical_assessment FROM anon;
        GRANT EXECUTE ON FUNCTION public.complete_clinical_assessment TO authenticated;
        GRANT EXECUTE ON FUNCTION public.complete_clinical_assessment TO service_role;
    END IF;
END $$;

COMMENT ON FUNCTION public.complete_clinical_assessment IS 
'Finalização atômica de sessão de avaliação. Restrito estritamente a utilizadores autenticados e service_role.';
