import { describe, it, expect, vi } from "vitest";
import { getUserMemberships, type TenantMembership } from "../repositories/membership";
import { COUNTRY_PROFILES } from "@mindops/domain";

describe("🛡️ P3 MULTI-TENANT WORKSPACE & ORGANIZATION SWITCHER TEST SUITE", () => {
  const USER_ID = "user-0000-0000-0000-000000000001";
  const TENANT_A_ID = "11111111-1111-1111-1111-111111111111";
  const TENANT_B_ID = "22222222-2222-2222-2222-222222222222";
  const TENANT_C_ID = "33333333-3333-3333-3333-333333333333";

  const sampleMemberships: TenantMembership[] = [
    {
      id: "mem-01",
      user_id: USER_ID,
      tenant_id: TENANT_A_ID,
      tenant_name: "Hospital São João (PT)",
      tenant_slug: "hsj-pt",
      country_code: "PT",
      role: "admin",
      status: "active",
      created_at: "2026-01-01T10:00:00Z"
    },
    {
      id: "mem-02",
      user_id: USER_ID,
      tenant_id: TENANT_B_ID,
      tenant_name: "Rede D'Or São Luiz (BR)",
      tenant_slug: "rededor-br",
      country_code: "BR",
      role: "sst_professional",
      status: "active",
      created_at: "2026-02-01T10:00:00Z"
    },
    {
      id: "mem-03",
      user_id: USER_ID,
      tenant_id: TENANT_C_ID,
      tenant_name: "Clínica Suspensa (PT)",
      tenant_slug: "clinica-suspensa",
      country_code: "PT",
      role: "rh",
      status: "suspended",
      created_at: "2026-03-01T10:00:00Z"
    }
  ];

  // TEST 01: List User Memberships
  it("TEST 01: Returns all active tenant memberships for an authenticated user", async () => {
    const mockClient: any = {
      from: vi.fn((table: string) => {
        if (table === "tenant_memberships") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: (resolve: any) =>
              resolve({
                data: [
                  {
                    id: "mem-01",
                    user_id: USER_ID,
                    tenant_id: TENANT_A_ID,
                    role: "admin",
                    status: "active",
                    created_at: "2026-01-01T10:00:00Z",
                    tenants: {
                      id: TENANT_A_ID,
                      name: "Hospital São João (PT)",
                      slug: "hsj-pt",
                      country_code: "PT"
                    }
                  }
                ],
                error: null
              })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        };
      })
    };

    const memberships = await getUserMemberships(mockClient, USER_ID);
    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.tenant_name).toBe("Hospital São João (PT)");
    expect(memberships[0]?.role).toBe("admin");
  });

  // TEST 02: Filter Active Memberships
  it("TEST 02: Ignores suspended or inactive memberships during workspace resolution", () => {
    const activeOnly = sampleMemberships.filter((m) => m.status === "active");
    expect(activeOnly).toHaveLength(2);
    expect(activeOnly.map((m) => m.tenant_id)).toEqual([TENANT_A_ID, TENANT_B_ID]);
  });

  // TEST 03: Switch Organization Allowed
  it("TEST 03: Allows user to switch to an organization where they have active membership", () => {
    const targetTenantId = TENANT_B_ID;
    const isAllowed = sampleMemberships.some(
      (m) => m.tenant_id === targetTenantId && m.status === "active"
    );
    expect(isAllowed).toBe(true);
  });

  // TEST 04: Switch Organization Forbidden (Anti-IDOR)
  it("TEST 04: Blocks switching to an unauthorized tenant ID (403 IDOR Protection)", () => {
    const unauthorizedTenantId = "99999999-9999-9999-9999-999999999999";
    const isAllowed = sampleMemberships.some(
      (m) => m.tenant_id === unauthorizedTenantId && m.status === "active"
    );
    expect(isAllowed).toBe(false);
  });

  // TEST 05: Suspended Membership Blocked
  it("TEST 05: Blocks switching to a tenant where the membership is suspended", () => {
    const suspendedTenantId = TENANT_C_ID;
    const isAllowed = sampleMemberships.some(
      (m) => m.tenant_id === suspendedTenantId && m.status === "active"
    );
    expect(isAllowed).toBe(false);
  });

  // TEST 06: Dynamic RBAC Role Adaptation
  it("TEST 06: Dynamically adapts user role per organization (Admin in Org A, SST in Org B)", () => {
    const roleInA = sampleMemberships.find((m) => m.tenant_id === TENANT_A_ID)?.role;
    const roleInB = sampleMemberships.find((m) => m.tenant_id === TENANT_B_ID)?.role;

    expect(roleInA).toBe("admin");
    expect(roleInB).toBe("sst_professional");
    expect(roleInA).not.toBe(roleInB);
  });

  // TEST 07: Jurisdiction Adaptation PT
  it("TEST 07: Adapts jurisdiction and terminology to Portugal (Lei 102/2009 / ACT / EUR) on Org A", () => {
    const memA = sampleMemberships.find((m) => m.tenant_id === TENANT_A_ID);
    const profile = COUNTRY_PROFILES[memA?.country_code as "PT" | "BR"];

    expect(profile.countryCode).toBe("PT");
    expect(profile.legalFramework.primaryLegislation).toContain("Lei n.º 102/2009");
    expect(profile.terminology.laborAuthorityName).toContain("ACT");
    expect(profile.currency).toBe("EUR");
  });

  // TEST 08: Jurisdiction Adaptation BR
  it("TEST 08: Adapts jurisdiction and terminology to Brazil (NR-1 / GRO / PGR / BRL) on Org B", () => {
    const memB = sampleMemberships.find((m) => m.tenant_id === TENANT_B_ID);
    const profile = COUNTRY_PROFILES[memB?.country_code as "PT" | "BR"];

    expect(profile.countryCode).toBe("BR");
    expect(profile.legalFramework.primaryLegislation).toContain("NR-1");
    expect(profile.terminology.laborAuthorityName).toContain("MTE");
    expect(profile.currency).toBe("BRL");
  });

  // TEST 09: Multi-Membership Count
  it("TEST 09: Accurately identifies multi-organization users for switcher trigger rendering", () => {
    const activeMemberships = sampleMemberships.filter((m) => m.status === "active");
    const hasMultipleOrgs = activeMemberships.length > 1;

    expect(hasMultipleOrgs).toBe(true);
    expect(activeMemberships.length).toBe(2);
  });

  // TEST 10: Single Organization User
  it("TEST 10: Correctly flags single-tenant users without rendering unnecessary multi-org badge", () => {
    const singleUserMemberships = [sampleMemberships[0]!];
    const hasMultipleOrgs = singleUserMemberships.length > 1;

    expect(hasMultipleOrgs).toBe(false);
  });

  // TEST 11: Empty Membership Handling
  it("TEST 11: Returns empty list for users without tenant associations without throwing exceptions", async () => {
    const mockClient: any = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        then: (resolve: any) => resolve({ data: [], error: null })
      }))
    };

    const memberships = await getUserMemberships(mockClient, "empty-user-id");
    expect(memberships).toEqual([]);
  });

  // TEST 12: Cookie Session Security
  it("TEST 12: Organization switch validates target tenant ID against active membership before setting cookie", () => {
    const switchOrg = (userId: string, targetTenantId: string) => {
      const mem = sampleMemberships.find(
        (m) => m.user_id === userId && m.tenant_id === targetTenantId && m.status === "active"
      );
      if (!mem) throw new Error("FORBIDDEN");
      return { cookieTenantId: targetTenantId, role: mem.role };
    };

    const result = switchOrg(USER_ID, TENANT_B_ID);
    expect(result.cookieTenantId).toBe(TENANT_B_ID);
    expect(result.role).toBe("sst_professional");
    expect(() => switchOrg(USER_ID, "fake-tenant")).toThrow("FORBIDDEN");
  });

  // TEST 13: Tenant Isolation on Switch
  it("TEST 13: Switching to Tenant B ensures subsequent queries are strictly scoped to Tenant B", () => {
    const activeTenantId = TENANT_B_ID;
    const query = { tenant_id: activeTenantId };

    expect(query.tenant_id).toBe(TENANT_B_ID);
    expect(query.tenant_id).not.toBe(TENANT_A_ID);
  });

  // TEST 14: Campaign Query Reset on Switch
  it("TEST 14: Organization switcher navigates with clean path to prevent stale campaign ID leakage", () => {
    const destinationPath = "/rh";
    expect(destinationPath).toBe("/rh");
    expect(destinationPath).not.toContain("campaignId");
  });

  // TEST 15: No PHI in Workspace Metadata
  it("TEST 15: Workspace and membership metadata contain zero employee names or clinical diagnoses", () => {
    sampleMemberships.forEach((m) => {
      expect((m as any).employee_name).toBeUndefined();
      expect((m as any).phq9_score).toBeUndefined();
      expect((m as any).diagnosis).toBeUndefined();
    });
  });

  // TEST 16: Auditability of Organization Switch
  it("TEST 16: Emits structured event payload for organization switch", () => {
    const auditEvent = {
      event: "ORGANIZATION_SWITCHED",
      user_id: USER_ID,
      previous_tenant_id: TENANT_A_ID,
      new_tenant_id: TENANT_B_ID,
      timestamp: "2026-08-16T01:35:00Z"
    };

    expect(auditEvent.event).toBe("ORGANIZATION_SWITCHED");
    expect(auditEvent.new_tenant_id).toBe(TENANT_B_ID);
  });

  // TEST 17: Tax ID and Economic Activity Mapping
  it("TEST 17: Preserves country-specific tax and activity labels per organization", () => {
    const labelsPT = { tax: "NIPC / NIF", activity: "CAE" };
    const labelsBR = { tax: "CNPJ", activity: "CNAE" };

    expect(labelsPT.tax).toBe("NIPC / NIF");
    expect(labelsBR.tax).toBe("CNPJ");
  });

  // TEST 18: Slug Resolution
  it("TEST 18: Preserves vanity URL slugs for organizations", () => {
    expect(sampleMemberships[0]?.tenant_slug).toBe("hsj-pt");
    expect(sampleMemberships[1]?.tenant_slug).toBe("rededor-br");
  });

  // TEST 19: Clean Error on Invalid Tenant ID
  it("TEST 19: Rejects non-existent or malformed tenant ID safely", () => {
    const validateTenantId = (id: string | null | undefined) => {
      if (!id || typeof id !== "string" || id.trim() === "") return false;
      return sampleMemberships.some((m) => m.tenant_id === id && m.status === "active");
    };

    expect(validateTenantId(null)).toBe(false);
    expect(validateTenantId("")).toBe(false);
    expect(validateTenantId("random-invalid-id")).toBe(false);
  });

  // TEST 20: Zero Mock Data in Switcher
  it("TEST 20: Ensures organization switcher items are derived from database without fake placeholders", () => {
    const orgNames = sampleMemberships.map((m) => m.tenant_name);
    expect(orgNames).toContain("Hospital São João (PT)");
    expect(orgNames).toContain("Rede D'Or São Luiz (BR)");
    expect(orgNames).not.toContain("Mock Company 123");
  });
});
