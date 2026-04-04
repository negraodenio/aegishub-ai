export interface RHOverview {
  totalEmployees: number;
  assessedEmployees: number;
  coveragePercent: number;
  complianceScore: number;
  openAlerts: number;
  openReferrals: number;
  highRiskPopulationPercent: number;
  avgCompositeRiskScore: number;
}

export interface RHBusinessUnitRisk {
  businessUnit: string;
  assessedCount: number;
  avgRiskScore: number;
  highRiskCount: number;
  criticalRiskCount: number;
}

export interface RHActionQueueItem {
  id: string;
  type: "nr1_action_plan" | "risk_alert" | "return_to_work" | "campaign" | "clinical_followup";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  employeeId: string; // Mandatory for secure invite generation
  ownerName?: string;
  businessUnit?: string;
  dueDate?: string;
  voicePath?: string;
  status: "open" | "in_progress" | "done" | "overdue";
}
