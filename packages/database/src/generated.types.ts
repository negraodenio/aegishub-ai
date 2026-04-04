export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: { id: string; name: string; slug: string; vertical: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; vertical?: string; created_at?: string };
        Update: { id?: string; name: string; slug: string; vertical?: string; created_at?: string };
      };
      profiles: {
        Row: { id: string; tenant_id: string; role: string; full_name: string; email: string; created_at: string };
        Insert: { id: string; tenant_id: string; role: string; full_name: string; email: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; role?: string; full_name?: string; email?: string; created_at?: string };
      };
      employees: {
        Row: { id: string; tenant_id: string; external_id: string | null; full_name: string; department: string | null; business_unit: string | null; site_name: string | null; manager_id: string | null; shift_type: string | null; status: string; created_at: string };
        Insert: { id?: string; tenant_id: string; external_id?: string | null; full_name: string; department?: string | null; business_unit?: string | null; site_name?: string | null; manager_id?: string | null; shift_type?: string | null; status?: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; external_id?: string | null; full_name?: string; department?: string | null; business_unit?: string | null; site_name?: string | null; manager_id?: string | null; shift_type?: string | null; status?: string; created_at?: string };
      };
      assessment_sessions: {
        Row: { id: string; tenant_id: string; employee_id: string; protocol_version: string; vertical_pack: string; status: string; created_at: string; started_at: string | null; completed_at: string | null };
        Insert: { id?: string; tenant_id: string; employee_id: string; protocol_version?: string; vertical_pack?: string; status?: string; created_at?: string; started_at?: string | null; completed_at?: string | null };
        Update: { id?: string; tenant_id?: string; employee_id?: string; protocol_version?: string; vertical_pack?: string; status?: string; created_at?: string; started_at?: string | null; completed_at?: string | null };
      };
      assessment_answers: {
        Row: { id: string; session_id: string; instrument_code: string; item_code: string; answer_numeric: number | null; answer_text: string | null; created_at: string };
        Insert: { id?: string; session_id: string; instrument_code: string; item_code: string; answer_numeric?: number | null; answer_text?: string | null; created_at?: string };
        Update: { id?: string; session_id?: string; instrument_code?: string; item_code?: string; answer_numeric?: number | null; answer_text?: string | null; created_at?: string };
      };
      assessment_scores: {
        Row: { id: string; session_id: string; phq9_score: number | null; gad7_score: number | null; burnout_score: number | null; wellbeing_score: number | null; psychosocial_risk_score: number | null; voice_signal_score: number | null; composite_risk_score: number; risk_level: string; requires_human_review: boolean; confidence: number; reasons: string[]; scored_at: string };
        Insert: { id?: string; session_id: string; phq9_score?: number | null; gad7_score?: number | null; burnout_score?: number | null; wellbeing_score?: number | null; psychosocial_risk_score?: number | null; voice_signal_score?: number | null; composite_risk_score: number; risk_level: string; requires_human_review?: boolean; confidence?: number; reasons?: string[]; scored_at?: string };
        Update: { id?: string; session_id?: string; phq9_score?: number | null; gad7_score?: number | null; burnout_score?: number | null; wellbeing_score?: number | null; psychosocial_risk_score?: number | null; voice_signal_score?: number | null; composite_risk_score?: number; risk_level?: string; requires_human_review?: boolean; confidence?: number; reasons?: string[]; scored_at?: string };
      };
      risk_alerts: {
        Row: { id: string; tenant_id: string; employee_id: string | null; session_id: string | null; alert_type: string; severity: string; requires_human_review: boolean; status: string; created_at: string };
        Insert: { id?: string; tenant_id: string; employee_id?: string | null; session_id?: string | null; alert_type: string; severity: string; requires_human_review?: boolean; status?: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; employee_id?: string | null; session_id?: string | null; alert_type?: string; severity?: string; requires_human_review?: boolean; status?: string; created_at?: string };
      };
      care_referrals: {
        Row: { id: string; tenant_id: string; employee_id: string; session_id: string | null; referral_type: string; urgency: string; status: string; created_at: string };
        Insert: { id?: string; tenant_id: string; employee_id: string; session_id?: string | null; referral_type: string; urgency?: string; status?: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; employee_id?: string; session_id?: string | null; referral_type?: string; urgency?: string; status?: string; created_at?: string };
      };
      manager_dashboard_aggregates: {
        Row: { id: string; tenant_id: string; org_unit_id: string | null; period_from: string; period_to: string; total_employees: number; assessed_count: number; low_risk_count: number; moderate_risk_count: number; high_risk_count: number; critical_risk_count: number; avg_composite_score: number | null; open_alerts_count: number; open_referrals_count: number; compliance_score: number | null; computed_at: string };
        Insert: { id?: string; tenant_id: string; org_unit_id?: string | null; period_from: string; period_to: string; total_employees?: number; assessed_count?: number; low_risk_count?: number; moderate_risk_count?: number; high_risk_count?: number; critical_risk_count?: number; avg_composite_score?: number | null; open_alerts_count?: number; open_referrals_count?: number; compliance_score?: number | null; computed_at?: string };
        Update: { id?: string; tenant_id?: string; org_unit_id?: string | null; period_from?: string; period_to?: string; total_employees?: number; assessed_count?: number; low_risk_count?: number; moderate_risk_count?: number; high_risk_count?: number; critical_risk_count?: number; avg_composite_score?: number | null; open_alerts_count?: number; open_referrals_count?: number; compliance_score?: number | null; computed_at?: string };
      };
      ai_decisions: {
        Row: { id: string; tenant_id: string; decision_type: string; status: string; memory_updates: any | null; created_at: string };
        Insert: { id?: string; tenant_id: string; decision_type: string; status?: string; memory_updates?: any | null; created_at?: string };
        Update: { id?: string; tenant_id?: string; decision_type?: string; status?: string; memory_updates?: any | null; created_at?: string };
      };
      ai_audit_logs: {
        Row: { id: string; decision_id: string; action: string; actor: string; old_memory: any | null; new_memory: any | null; scaffold_changes: any | null; created_at: string };
        Insert: { id?: string; decision_id: string; action: string; actor: string; old_memory?: any | null; new_memory?: any | null; scaffold_changes?: any | null; created_at?: string };
        Update: { id?: string; decision_id?: string; action?: string; actor?: string; old_memory?: any | null; new_memory?: any | null; scaffold_changes?: any | null; created_at?: string };
      };
    };
  };
};
