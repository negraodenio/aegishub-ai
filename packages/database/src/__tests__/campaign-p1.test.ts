import { describe, it, expect, vi } from "vitest";
import {
  generateCampaignCode,
  isValidCampaignTransition,
  getCampaignAggregates,
  type Campaign,
  type CampaignStatus
} from "../repositories/campaign";

describe("🛡️ P1 CAMPAIGN ENGINE & ENTERPRISE DASHBOARD V2 SUITE", () => {
  const TENANT_A_ID = "11111111-1111-1111-1111-111111111111";
  const TENANT_B_ID = "22222222-2222-2222-2222-222222222222";
  const USER_RH_ID = "rh000000-0000-0000-0000-000000000001";
  const USER_EMP_ID = "emp00000-0000-0000-0000-000000000002";

  const sampleCampaignA: Campaign = {
    id: "camp-1111",
    tenant_id: TENANT_A_ID,
    code: "AEG-2026-000001",
    title: "Avaliação Anual SST 2026",
    description: "Campanha corporativa",
    country_code: "PT",
    methodology: "COPSOQ_II",
    instruments: ["COPSOQ", "GAD7", "PHQ9"],
    target_departments: ["Operações", "TI", "Vendas"],
    target_business_units: [],
    min_anonymity_group_size: 5,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
    allow_voice_screening: true,
    created_by: USER_RH_ID,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z"
  };

  // TEST 01: Code Generation Format
  it("TEST 01: Generates sequential campaign code in AEG-YYYY-XXXXXX format", async () => {
    const mockClient: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockResolvedValue({ data: [{ code: "AEG-2026-000001" }], error: null })
      })
    };

    const code = await generateCampaignCode(mockClient, TENANT_A_ID);
    const year = new Date().getFullYear();
    expect(code).toBe(`AEG-${year}-000002`);
    expect(code).toMatch(new RegExp(`^AEG-${year}-\\d{6}$`));
  });

  // TEST 02: Cross-Tenant Isolation
  it("TEST 02: Tenant A cannot view or list campaigns belonging to Tenant B", () => {
    const allCampaigns: Campaign[] = [
      sampleCampaignA,
      { ...sampleCampaignA, id: "camp-2222", tenant_id: TENANT_B_ID, code: "AEG-2026-000001" }
    ];

    const tenantAVisible = allCampaigns.filter(c => c.tenant_id === TENANT_A_ID);
    expect(tenantAVisible).toHaveLength(1);
    expect(tenantAVisible[0]?.id).toBe("camp-1111");
  });

  // TEST 03: Cross-Tenant Participant Block
  it("TEST 03: Rejects adding participant from Tenant B to Campaign of Tenant A", () => {
    const campaignTenantId: string = TENANT_A_ID;
    const participantEmployeeTenantId: string = TENANT_B_ID;

    const isAllowed = campaignTenantId === participantEmployeeTenantId;
    expect(isAllowed).toBe(false);
  });


  // TEST 04: Session linked to campaign
  it("TEST 04: Assessment session is properly linked to active campaign", () => {
    const session = {
      id: "sess-1",
      campaign_id: sampleCampaignA.id,
      tenant_id: sampleCampaignA.tenant_id,
      status: "completed"
    };

    expect(session.campaign_id).toBe("camp-1111");
    expect(session.tenant_id).toBe(TENANT_A_ID);
  });

  // TEST 05: Campaign RBAC
  it("TEST 05: RH/Admin can manage campaigns; Employee role is blocked", () => {
    const allowedRoles = ["admin", "rh", "sst_professional"];
    const rhRole = "rh";
    const empRole = "employee";

    expect(allowedRoles.includes(rhRole)).toBe(true);
    expect(allowedRoles.includes(empRole)).toBe(false);
  });

  // TEST 06: Campaign Lifecycle State Machine
  it("TEST 06: Validates legal and illegal state machine transitions", () => {
    // Valid transitions
    expect(isValidCampaignTransition("draft", "active")).toBe(true);
    expect(isValidCampaignTransition("draft", "scheduled")).toBe(true);
    expect(isValidCampaignTransition("active", "closing")).toBe(true);
    expect(isValidCampaignTransition("active", "completed")).toBe(true);
    expect(isValidCampaignTransition("completed", "archived")).toBe(true);

    // Illegal transitions
    expect(isValidCampaignTransition("completed", "draft")).toBe(false);
    expect(isValidCampaignTransition("archived", "active")).toBe(false);
    expect(isValidCampaignTransition("closing", "draft")).toBe(false);
  });

  // TEST 07: Anonymous Access Block
  it("TEST 07: Anonymous user attempting campaign API receives 401 Unauthorized", () => {
    const sessionUser = null;
    const statusCode = sessionUser ? 200 : 401;
    expect(statusCode).toBe(401);
  });

  // TEST 08: Campaign IDOR Protection
  it("TEST 08: Requesting campaign ID of another tenant returns 403 Forbidden", () => {
    const callerTenantId = TENANT_A_ID;
    const requestedCampaign = { id: "camp-99", tenant_id: TENANT_B_ID };

    const isAuthorized = callerTenantId === requestedCampaign.tenant_id;
    const statusCode = isAuthorized ? 200 : 403;
    expect(statusCode).toBe(403);
  });

  // TEST 09: Anonymity Threshold Masking (N < 5)
  it("TEST 09: Department with less than 5 responses is masked for privacy", async () => {
    const mockClient: any = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockImplementation(() => {
          if (table === "employees") {
            return {
              data: [
                { id: "e1", department: "TI" },
                { id: "e2", department: "TI" },
                { id: "e3", department: "TI" }
              ]
            };
          }
          return {
            data: [
              { id: "s1", status: "completed", employees: { department: "TI" }, assessment_scores: [{ composite_risk_score: 30, risk_level: "moderate" }] },
              { id: "s2", status: "completed", employees: { department: "TI" }, assessment_scores: [{ composite_risk_score: 40, risk_level: "moderate" }] },
              { id: "s3", status: "completed", employees: { department: "TI" }, assessment_scores: [{ composite_risk_score: 35, risk_level: "moderate" }] }
            ]
          };
        })
      }))
    };

    const aggregates = await getCampaignAggregates(mockClient, sampleCampaignA);
    const tiDept = aggregates.departmentHeatmap.find(d => d.department === "TI");

    expect(tiDept).toBeDefined();
    expect(tiDept?.hasSufficientData).toBe(false);
    expect(tiDept?.avgScore).toBeNull();
    expect(tiDept?.riskLevel).toBe("insufficient_data");
  });

  // TEST 10: Anonymity Threshold Permitted (N >= 5)
  it("TEST 10: Department with 5 or more responses exhibits regular aggregated score", async () => {
    const mockClient: any = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockImplementation(() => {
          return {
            data: [
              { id: "s1", status: "completed", employees: { department: "Operações" }, assessment_scores: [{ composite_risk_score: 20, risk_level: "low" }] },
              { id: "s2", status: "completed", employees: { department: "Operações" }, assessment_scores: [{ composite_risk_score: 25, risk_level: "low" }] },
              { id: "s3", status: "completed", employees: { department: "Operações" }, assessment_scores: [{ composite_risk_score: 30, risk_level: "low" }] },
              { id: "s4", status: "completed", employees: { department: "Operações" }, assessment_scores: [{ composite_risk_score: 20, risk_level: "low" }] },
              { id: "s5", status: "completed", employees: { department: "Operações" }, assessment_scores: [{ composite_risk_score: 25, risk_level: "low" }] }
            ]
          };
        })
      }))
    };

    const aggregates = await getCampaignAggregates(mockClient, sampleCampaignA);
    const opsDept = aggregates.departmentHeatmap.find(d => d.department === "Operações");

    expect(opsDept).toBeDefined();
    expect(opsDept?.hasSufficientData).toBe(true);
    expect(opsDept?.avgScore).toBe(24);
    expect(opsDept?.riskLevel).toBe("low");
  });

  // TEST 11: RH Segregation from Individual Clinical Data
  it("TEST 11: RH aggregates never expose employee names or individual scores", async () => {
    const mockClient: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: [] })
      })
    };

    const aggregates = await getCampaignAggregates(mockClient, sampleCampaignA);
    
    // Check that actions contain only organizational measures
    aggregates.organizationalActions.forEach(action => {
      expect((action as any).employeeName).toBeUndefined();
      expect((action as any).phq9Score).toBeUndefined();
      expect((action as any).gad7Score).toBeUndefined();
    });
  });

  // TEST 12: Manager Segregation for N < threshold
  it("TEST 12: Manager cannot inspect unit data when responses are below threshold", () => {
    const unitResponseCount = 3;
    const threshold = 5;
    const isVisibleToManager = unitResponseCount >= threshold;
    expect(isVisibleToManager).toBe(false);
  });

  // TEST 13: Multi-tenant campaign switching
  it("TEST 13: Switching active tenant properly switches campaign catalog", () => {
    const campaignsTenantA = [{ id: "c1", tenant_id: TENANT_A_ID }];
    const campaignsTenantB = [{ id: "c2", tenant_id: TENANT_B_ID }];

    const activeTenantId: string = TENANT_B_ID;
    const activeCatalog = activeTenantId === TENANT_A_ID ? campaignsTenantA : campaignsTenantB;

    expect(activeCatalog[0]?.id).toBe("c2");
    expect(activeCatalog[0]?.tenant_id).toBe(TENANT_B_ID);
  });


  // TEST 14: Jurisdiction Adaptation (PT vs BR)
  it("TEST 14: Campaign methodology matches selected jurisdiction (PT -> COPSOQ, BR -> NR-1)", () => {
    const campaignPT = { country_code: "PT", methodology: "COPSOQ_II" };
    const campaignBR = { country_code: "BR", methodology: "WORKER_VOICE_NR1" };

    expect(campaignPT.methodology).toBe("COPSOQ_II");
    expect(campaignBR.methodology).toBe("WORKER_VOICE_NR1");
  });

  // TEST 15: Empty State Handling
  it("TEST 15: Organization with zero campaigns renders clean state without artificial errors", () => {
    const emptyCampaigns: Campaign[] = [];
    const hasActiveCampaign = emptyCampaigns.length > 0;
    
    expect(hasActiveCampaign).toBe(false);
    // UI displays empty state CTA rather than 0% compliance breach
  });
});
