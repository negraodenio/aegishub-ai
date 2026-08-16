# P5.1 Security Remediation Report
**Engine:** Gemini 3.7 Flash  
**Mode:** Enterprise Software Engineering / Security-First  
**Date:** 2026-08-16

## 1. Executive Summary

An independent Codex 5.5 High adversarial security review identified critical weaknesses in the AegisHub AI P5.1 implementation, specifically around client-controlled tenant resolution, race conditions in LLM leases, and missing centralized consent/entitlement enforcement.

This remediation phase systematically addressed these findings by enforcing server-side authority at all boundaries, establishing an atomic database locking mechanism for quotas, and verifying cross-tenant isolation (IDOR protection) via a restored and fully executed test suite. No product redesign or feature removal was performed.

## 2. Codex Findings

The audit discovered the following critical (P1) vulnerabilities:
- **P1 Client-Controlled Tenant ID:** Endpoints trusted `req.body.tenantId`, allowing a user to spoof operations into another tenant's context.
- **P1 Consent Bypass:** Consent checks were missing or inconsistently applied across endpoints.
- **P1 Entitlement Bypass:** Commercial control plane feature flags (`cognitive_support`) were not strictly enforced server-side.
- **P1 LLM Guard Race Condition:** The lease acquisition used in-memory JS checks, which could be bypassed under concurrent load, overflowing the daily cost limit.
- **P1 Test Infrastructure Failure:** `npm test` passed by silently running 0 tests in the database package.

## 3. Findings Fixed

1. **Test Infrastructure:** Fixed root `package.json` and `packages/database/package.json` to properly invoke `vitest run`, exposing and executing the hidden test suite.
2. **Tenant Context Architecture:** Created `resolveAuthorizedTenantContext` which strictly intersects any client-requested `tenantId` with the authenticated user's actual database memberships (`getUserMemberships`).
3. **Consent Enforcement:** Integrated `getCognitiveUserProfile` into all 8 cognitive endpoints to mandate active, non-revoked consent before LLM or DB operations.
4. **Entitlement Enforcement:** Integrated `checkFeatureEntitlement` across all cognitive endpoints.
5. **Atomic LLM Lease:** Implemented `acquire_llm_lease` via PL/pgSQL to enforce an atomic database-level quota lock. 

## 4. Tenant Context Architecture

Client-provided `tenantId` is no longer treated as an authoritative security context. It is now treated strictly as a *selection preference*.
- If a user has exactly one active membership, that tenant is automatically used.
- If a user has multiple memberships, the requested `tenantId` is intersected with their memberships. If it doesn't match, the request is rejected with `UNAUTHORIZED_TENANT_CONTEXT`.
- All `/api/cognitive/*` endpoints were refactored to use `resolveAuthorizedTenantContext`.

## 5. IDOR Protection & Privacy (RLS)

- Users can only interact with focus sessions, stuck events, and energy check-ins that belong to them AND their authorized tenant.
- HR/Managers only receive aggregated analytics (respecting the $N \geq 20$ rule).
- Administrative capabilities are scoped strictly by the Commercial Control Plane.

## 6. Atomic LLM Lease & Quota

The `LLMGuardSession` was refactored to support asynchronous DB locks. 
- Migration `20260818_llm_guard_atomic_lease.sql` created an `ON CONFLICT DO UPDATE` function `acquire_llm_lease`.
- The atomic check guarantees `daily_cost_usd + p_estimated_cost <= p_max_daily_cost` at the database write boundary.
- Concurrent requests that would push the tenant over the $0.25 limit are reliably rejected with `QUOTA_EXCEEDED` before the LLM provider is invoked.
- Fail-closed reconciliation is maintained.

## 7. AI Governance & Clinical Boundaries

- The system strictly acts as an Executive Support/Workplace Productivity assistant.
- PII Detection and Output Safety layers remain fully active.
- Any attempt to inject clinical terms (ADHD, DSM, etc.) is blocked by the output guardrails.

## 8. Actual Test Results

The test suite now correctly runs and executes all security scenarios.
- **Test Files:** 18
- **Tests Executed:** 333
- **Tests Passed:** 333
- **Typecheck:** PASS (0 errors after AST/Typescript refactoring)
- **Production Build:** PASS (Optimized production build successful)

### Tests Added / Validated
1. Client tenantId injection
2. Cross-tenant IDOR (create, read, update, delete)
3. Missing/Revoked consent
4. Entitlement bypass (Starter plan block)
5. Concurrent quota consumption & overflow ($0.25 limit)
6. Multiple memberships without valid tenant selection
7. LLM call blocked when quota exhausted

## 9. Remaining Risks & Limitations

- **REQUIRES FURTHER REVIEW:** While the atomic lease prevents concurrent quota overflow at the lease phase, extremely large LLM outputs that vastly exceed the `estimatedOutputTokens` could theoretically push the *actual* reconciled cost slightly over the limit after the fact. This is mitigated by output length caps but is a known limitation of pre-flight token estimation.
- **NOT VERIFIED:** EU AI Act compliance is a legal determination and cannot be programmatically certified purely by passing unit tests, although the technical telemetry and hashing mechanisms required for compliance are in place.
