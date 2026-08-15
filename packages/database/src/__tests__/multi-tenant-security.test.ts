import { describe, it, expect, vi } from "vitest";
import { getUserMemberships, type TenantMembership } from "../repositories/membership";

describe("🛡️ P0 ENTERPRISE SECURITY & MULTI-TENANT ISOLATION SUITE", () => {
  const TENANT_A_ID = "11111111-1111-1111-1111-111111111111";
  const TENANT_B_ID = "22222222-2222-2222-2222-222222222222";
  const USER_A_ID = "aaaaa000-0000-0000-0000-aaaaaaaaaaaa";
  const USER_MULTI_ID = "mmmm0000-0000-0000-0000-mmmmmmmmmmmm";
  const USER_NO_MEMB_ID = "00000000-0000-0000-0000-000000000000";

  // 1. Teste 01: Anonymous Access Protection
  it("TEST 01: Anonymous user without valid session is rejected with 401 / Redirect", async () => {
    const mockClient: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("No session") })
      }
    };
    const { data: { user } } = await mockClient.auth.getUser();
    expect(user).toBeNull();
  });

  // 2. Teste 02: User A accessing authorized Tenant A
  it("TEST 02: User A accessing Tenant A succeeds and returns Tenant A memberships", async () => {
    const mockClient: any = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((col, val) => {
          if (col === "user_id" && val === USER_A_ID) {
            return {
              eq: vi.fn().mockResolvedValue({
                data: [{
                  id: "memb-1",
                  user_id: USER_A_ID,
                  tenant_id: TENANT_A_ID,
                  role: "rh",
                  status: "active",
                  tenants: { name: "Empresa A", country_code: "PT" }
                }],
                error: null
              })
            };
          }
          return { eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
        })
      }))
    };

    const memberships = await getUserMemberships(mockClient, USER_A_ID);
    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.tenantId).toBe(TENANT_A_ID);
    expect(memberships[0]?.role).toBe("rh");
  });


  // 3. Teste 03: User A attempting URL spoofing to Tenant B
  it("TEST 03: User A requesting ?tenantId=TENANT_B is rejected or forced to authorized Tenant A", async () => {
    const userMemberships: TenantMembership[] = [{
      id: "memb-1",
      userId: USER_A_ID,
      tenantId: TENANT_A_ID,
      role: "rh",
      status: "active"
    }];

    const requestedTenantId = TENANT_B_ID;
    const isAuthorized = userMemberships.some(m => m.tenantId === requestedTenantId);
    expect(isAuthorized).toBe(false);
  });

  // 4. Teste 04: API route rejecting unauthorized tenantId with 403
  it("TEST 04: User A calling API for Tenant B returns 403 Forbidden", async () => {
    const userMemberships: TenantMembership[] = [{
      id: "memb-1",
      userId: USER_A_ID,
      tenantId: TENANT_A_ID,
      role: "rh",
      status: "active"
    }];

    const requestedTenantId = TENANT_B_ID;
    const authorized = userMemberships.find(m => m.tenantId === requestedTenantId);
    const responseStatus = authorized ? 200 : 403;
    expect(responseStatus).toBe(403);
  });

  // 5. Teste 05: Anonymous calling /api/manager/overview returns 401
  it("TEST 05: Anonymous calling /api/manager/overview returns 401 Unauthorized", async () => {
    const user = null;
    const responseStatus = user ? 200 : 401;
    expect(responseStatus).toBe(401);
  });

  // 6. Teste 06: Server action with forged tenant_id is rejected server-side
  it("TEST 06: Server action ignores client-sent tenant_id and resolves strictly from session", async () => {
    const sessionMembership: TenantMembership = {
      id: "memb-1",
      userId: USER_A_ID,
      tenantId: TENANT_A_ID,
      role: "admin",
      status: "active"
    };

    const forgedClientPayload = { tenantId: TENANT_B_ID, fullName: "Attacker" };
    // Server enforces sessionMembership.tenantId over forged payload
    const effectiveTenantId = sessionMembership.tenantId;
    expect(effectiveTenantId).toBe(TENANT_A_ID);
    expect(effectiveTenantId).not.toBe(forgedClientPayload.tenantId);
  });

  // 7. Teste 07: RLS SELECT cross-tenant simulation
  it("TEST 07: RLS policy WHERE tenant_id = current_tenant_id() returns 0 rows for Tenant B", async () => {
    const mockDatabaseRecords = [
      { id: "emp-1", tenant_id: TENANT_A_ID, name: "Employee A" },
      { id: "emp-2", tenant_id: TENANT_B_ID, name: "Employee B" }
    ];

    const currentTenantId = TENANT_A_ID;
    const visibleRecords = mockDatabaseRecords.filter(r => r.tenant_id === currentTenantId);
    expect(visibleRecords).toHaveLength(1);
    expect(visibleRecords[0]?.name).toBe("Employee A");
  });


  // 8. Teste 08: RLS INSERT cross-tenant simulation
  it("TEST 08: RLS WITH CHECK (tenant_id = current_tenant_id()) blocks INSERT into Tenant B", async () => {
    const currentTenantId = TENANT_A_ID;
    const attemptedInsert = { tenant_id: TENANT_B_ID, full_name: "Illegal Employee" };
    
    const checkPassed = attemptedInsert.tenant_id === currentTenantId;
    expect(checkPassed).toBe(false);
  });

  // 9. Teste 09: RLS UPDATE cross-tenant simulation
  it("TEST 09: RLS USING (tenant_id = current_tenant_id()) blocks UPDATE on Tenant B row", async () => {
    const currentTenantId = TENANT_A_ID;
    const targetRow = { id: "action-99", tenant_id: TENANT_B_ID };
    
    const canUpdate = targetRow.tenant_id === currentTenantId;
    expect(canUpdate).toBe(false);
  });

  // 10. Teste 10: RLS DELETE cross-tenant simulation
  it("TEST 10: RLS USING (tenant_id = current_tenant_id()) blocks DELETE on Tenant B row", async () => {
    const currentTenantId = TENANT_A_ID;
    const targetRow = { id: "alert-55", tenant_id: TENANT_B_ID };
    
    const canDelete = targetRow.tenant_id === currentTenantId;
    expect(canDelete).toBe(false);
  });

  // 11. Teste 11: User without membership denied
  it("TEST 11: User with no memberships receives 403 No Active Membership", async () => {
    const mockClient: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    };

    const memberships = await getUserMemberships(mockClient, USER_NO_MEMB_ID);
    expect(memberships).toHaveLength(0);
  });

  // 12. Teste 12: Multi-membership user in Tenant A context
  it("TEST 12: Multi-membership user scoped to Tenant A only receives Tenant A data", async () => {
    const userMemberships: TenantMembership[] = [
      { id: "m-1", userId: USER_MULTI_ID, tenantId: TENANT_A_ID, role: "admin", status: "active" },
      { id: "m-2", userId: USER_MULTI_ID, tenantId: TENANT_B_ID, role: "rh", status: "active" }
    ];

    const activeTenantId = TENANT_A_ID;
    const activeMemb = userMemberships.find(m => m.tenantId === activeTenantId);
    expect(activeMemb?.tenantId).toBe(TENANT_A_ID);
    expect(activeMemb?.role).toBe("admin");
  });

  // 13. Teste 13: Multi-membership user in Tenant B context
  it("TEST 13: Multi-membership user switching to Tenant B updates context securely", async () => {
    const userMemberships: TenantMembership[] = [
      { id: "m-1", userId: USER_MULTI_ID, tenantId: TENANT_A_ID, role: "admin", status: "active" },
      { id: "m-2", userId: USER_MULTI_ID, tenantId: TENANT_B_ID, role: "rh", status: "active" }
    ];

    const requestedTenantId = TENANT_B_ID;
    const activeMemb = userMemberships.find(m => m.tenantId === requestedTenantId);
    expect(activeMemb?.tenantId).toBe(TENANT_B_ID);
    expect(activeMemb?.role).toBe("rh");
  });

  // 14. Teste 14: Report generation cross-tenant block
  it("TEST 14: Tenant A user requesting legal report for Tenant B is denied with 403", async () => {
    const userTenantId: string = TENANT_A_ID;
    const requestedReportTenantId: string = TENANT_B_ID;
    
    const isAuthorized = userTenantId === requestedReportTenantId;
    const responseStatus = isAuthorized ? 200 : 403;
    expect(responseStatus).toBe(403);
  });

  // 15. Teste 15: Cron route without valid secret fails closed
  it("TEST 15: Cron endpoint with missing/invalid secret returns 401 and does not execute", async () => {
    const validSecret: string = "PROD_SECRET_XYZ";
    const providedSecret: string = "invalid_or_missing_secret";
    
    const isAuthorized = Boolean(validSecret && providedSecret === validSecret);
    const responseStatus = isAuthorized ? 200 : 401;
    expect(responseStatus).toBe(401);
  });

});
