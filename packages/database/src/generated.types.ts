export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: { 
          id: string; 
          name: string; 
          slug: string; 
          country_code?: string;
          tax_id?: string | null;
          economic_activity_code?: string | null;
          vertical: string; 
          created_at: string 
        };
        Insert: { 
          id?: string; 
          name: string; 
          slug: string; 
          country_code?: string;
          tax_id?: string | null;
          economic_activity_code?: string | null;
          vertical?: string; 
          created_at?: string 
        };
        Update: { 
          id?: string; 
          name?: string; 
          slug?: string; 
          country_code?: string;
          tax_id?: string | null;
          economic_activity_code?: string | null;
          vertical?: string; 
          created_at?: string 
        };
      };
      profiles: {
        Row: { id: string; tenant_id: string; role: string; full_name: string; email: string; created_at: string };
        Insert: { id: string; tenant_id: string; role: string; full_name: string; email: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; role?: string; full_name?: string; email?: string; created_at?: string };
      };
      tenant_memberships: {
        Row: { id: string; user_id: string; tenant_id: string; role: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; tenant_id: string; role?: string; status?: string; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; tenant_id?: string; role?: string; status?: string; created_at?: string; updated_at?: string };
      };

      campaigns: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          title: string;
          description: string | null;
          country_code: string;
          methodology: string;
          instruments: string[];
          target_departments: string[] | null;
          target_business_units: string[] | null;
          min_anonymity_group_size: number;
          start_date: string;
          end_date: string;
          status: "draft" | "scheduled" | "active" | "closing" | "completed" | "archived";
          allow_voice_screening: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          title: string;
          description?: string | null;
          country_code?: string;
          methodology?: string;
          instruments?: string[];
          target_departments?: string[] | null;
          target_business_units?: string[] | null;
          min_anonymity_group_size?: number;
          start_date: string;
          end_date: string;
          status?: "draft" | "scheduled" | "active" | "closing" | "completed" | "archived";
          allow_voice_screening?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          country_code?: string;
          methodology?: string;
          instruments?: string[];
          target_departments?: string[] | null;
          target_business_units?: string[] | null;
          min_anonymity_group_size?: number;
          start_date?: string;
          end_date?: string;
          status?: "draft" | "scheduled" | "active" | "closing" | "completed" | "archived";
          allow_voice_screening?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_participants: {
        Row: {
          id: string;
          tenant_id: string;
          campaign_id: string;
          employee_id: string;
          status: string;
          invited_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          campaign_id: string;
          employee_id: string;
          status?: string;
          invited_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          campaign_id?: string;
          employee_id?: string;
          status?: string;
          invited_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: { id: string; tenant_id: string; external_id: string | null; full_name: string; department: string | null; business_unit: string | null; site_name: string | null; manager_id: string | null; shift_type: string | null; status: string; created_at: string };
        Insert: { id?: string; tenant_id: string; external_id?: string | null; full_name: string; department?: string | null; business_unit?: string | null; site_name?: string | null; manager_id?: string | null; shift_type?: string | null; status?: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; external_id?: string | null; full_name?: string; department?: string | null; business_unit?: string | null; site_name?: string | null; manager_id?: string | null; shift_type?: string | null; status?: string; created_at?: string };
      };
      assessment_sessions: {
        Row: { id: string; tenant_id: string; campaign_id: string | null; employee_id: string; protocol_version: string; vertical_pack: string; status: string; created_at: string; started_at: string | null; completed_at: string | null };
        Insert: { id?: string; tenant_id: string; campaign_id?: string | null; employee_id: string; protocol_version?: string; vertical_pack?: string; status?: string; created_at?: string; started_at?: string | null; completed_at?: string | null };
        Update: { id?: string; tenant_id?: string; campaign_id?: string | null; employee_id?: string; protocol_version?: string; vertical_pack?: string; status?: string; created_at?: string; started_at?: string | null; completed_at?: string | null };
      };

      assessment_answers: {
        Row: { id: string; session_id: string; instrument_code: string; item_code: string; answer_numeric: number | null; answer_text: string | null; created_at: string };
        Insert: { id?: string; session_id: string; instrument_code: string; item_code: string; answer_numeric?: number | null; answer_text?: string | null; created_at?: string };
        Update: { id?: string; session_id?: string; instrument_code?: string; item_code?: string; answer_numeric?: number | null; answer_text?: string | null; created_at?: string };
      };
      assessment_scores: {
        Row: { id: string; session_id: string; phq9_score: number | null; gad7_score: number | null; burnout_score: number | null; wellbeing_score: number | null; psychosocial_risk_score: number | null; voice_signal_score: number | null; voice_path: string | null; composite_risk_score: number; risk_level: string; requires_human_review: boolean; confidence: number; reasons: string[]; scored_at: string };
        Insert: { id?: string; session_id: string; phq9_score?: number | null; gad7_score?: number | null; burnout_score?: number | null; wellbeing_score?: number | null; psychosocial_risk_score?: number | null; voice_signal_score?: number | null; voice_path?: string | null; composite_risk_score: number; risk_level: string; requires_human_review?: boolean; confidence?: number; reasons?: string[]; scored_at?: string };
        Update: { id?: string; session_id?: string; phq9_score?: number | null; gad7_score?: number | null; burnout_score?: number | null; wellbeing_score?: number | null; psychosocial_risk_score?: number | null; voice_signal_score?: number | null; voice_path?: string | null; composite_risk_score?: number; risk_level?: string; requires_human_review?: boolean; confidence?: number; reasons?: string[]; scored_at?: string };
      };
      risk_alerts: {
        Row: { id: string; tenant_id: string; employee_id: string | null; session_id: string | null; alert_type: string; severity: string; requires_human_review: boolean; status: string; created_at: string };
        Insert: { id?: string; tenant_id: string; employee_id?: string | null; session_id?: string | null; alert_type: string; severity: string; requires_human_review?: boolean; status?: string; created_at?: string };
        Update: { id?: string; tenant_id?: string; employee_id?: string | null; session_id?: string | null; alert_type?: string; severity?: string; requires_human_review?: boolean; status?: string; created_at?: string };
      };
      corrective_actions: {
        Row: {
          id: string;
          tenant_id: string;
          assessment_score_id: string | null;
          title: string;
          description: string | null;
          status: string | null;
          priority: string | null;
          assigned_to: string | null;
          responsible_name: string | null;
          hazard_factor: string | null;
          process_activity: string | null;
          evidence_url: string | null;
          evidence_notes: string | null;
          effectiveness_score: number | null;
          reassessment_date: string | null;
          reassessment_status: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          assessment_score_id?: string | null;
          title: string;
          description?: string | null;
          status?: string | null;
          priority?: string | null;
          assigned_to?: string | null;
          responsible_name?: string | null;
          hazard_factor?: string | null;
          process_activity?: string | null;
          evidence_url?: string | null;
          evidence_notes?: string | null;
          effectiveness_score?: number | null;
          reassessment_date?: string | null;
          reassessment_status?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          assessment_score_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string | null;
          priority?: string | null;
          assigned_to?: string | null;
          responsible_name?: string | null;
          hazard_factor?: string | null;
          process_activity?: string | null;
          evidence_url?: string | null;
          evidence_notes?: string | null;
          effectiveness_score?: number | null;
          reassessment_date?: string | null;
          reassessment_status?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      consent_logs: {
        Row: { id: string; employee_id: string | null; tenant_id: string | null; consent_type: string; is_granted: boolean; terms_version: string | null; ip_address: string | null; user_agent: string | null; created_at: string };
        Insert: { id?: string; employee_id?: string | null; tenant_id?: string | null; consent_type: string; is_granted?: boolean; terms_version?: string | null; ip_address?: string | null; user_agent?: string | null; created_at?: string };
        Update: { id?: string; employee_id?: string | null; tenant_id?: string | null; consent_type?: string; is_granted?: boolean; terms_version?: string | null; ip_address?: string | null; user_agent?: string | null; created_at?: string };
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
        Row: {
          id: string;
          tenant_id: string;
          created_at: string;
          updated_at?: string;
          input_hash?: string | null;
          output_hash?: string | null;
          model_used?: string | null;
          model_version?: string | null;
          score?: number | null;
          vertical?: string | null;
          decision_type?: string | null;
          decision?: any | null;
          reasons?: any | null;
          recommendation?: any | null;
          risk_level?: string | null;
          requires_human_review?: boolean | null;
          human_validated?: boolean | null;
          human_action?: string | null;
          human_feedback?: string | null;
          memory_updates?: any | null;
          status: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          created_at?: string;
          updated_at?: string;
          input_hash?: string | null;
          output_hash?: string | null;
          model_used?: string | null;
          model_version?: string | null;
          score?: number | null;
          vertical?: string | null;
          decision_type?: string | null;
          decision?: any | null;
          reasons?: any | null;
          recommendation?: any | null;
          risk_level?: string | null;
          requires_human_review?: boolean | null;
          human_validated?: boolean | null;
          human_action?: string | null;
          human_feedback?: string | null;
          memory_updates?: any | null;
          status?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          created_at?: string;
          updated_at?: string;
          input_hash?: string | null;
          output_hash?: string | null;
          model_used?: string | null;
          model_version?: string | null;
          score?: number | null;
          vertical?: string | null;
          decision_type?: string | null;
          decision?: any | null;
          reasons?: any | null;
          recommendation?: any | null;
          risk_level?: string | null;
          requires_human_review?: boolean | null;
          human_validated?: boolean | null;
          human_action?: string | null;
          human_feedback?: string | null;
          memory_updates?: any | null;
          status?: string;
        };
      };
      ai_audit_logs: {
        Row: {
          id: string;
          decision_id: string;
          action: string;
          actor: string;
          details?: any | null;
          old_memory?: any | null;
          new_memory?: any | null;
          scaffold_changes?: any | null;
          created_at: string;
          timestamp?: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          action: string;
          actor: string;
          details?: any | null;
          old_memory?: any | null;
          new_memory?: any | null;
          scaffold_changes?: any | null;
          created_at?: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          decision_id?: string;
          action?: string;
          actor?: string;
          details?: any | null;
          old_memory?: any | null;
          new_memory?: any | null;
          scaffold_changes?: any | null;
          created_at?: string;
          timestamp?: string;
        };
      };

    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: "admin" | "rh" | "manager" | "sst_professional" | "health_professional" | "employee" | "dpo" | "auditor";
      campaign_status: "draft" | "scheduled" | "active" | "closing" | "completed" | "archived";
      campaign_participant_status: "pending" | "invited" | "in_progress" | "completed" | "opted_out";
    };
  };
};


