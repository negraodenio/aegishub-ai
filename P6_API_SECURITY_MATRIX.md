# P6 API SECURITY MATRIX
**Documento:** `P6_API_SECURITY_MATRIX.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Security Architect

---

## 1. INVENTÁRIO DE ROUTE HANDLERS (`apps/web/app/api`)

| Endpoint | Método | Autenticação | RBAC / Autorização | Resolução de Tenant | Validação de Entrada | Rate Limiting | Audit Log | Status de Segurança |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/api/cognitive/tasks/decompose` | POST | `auth.getUser()` | Colaborador (Consentimento ativo) | Via payload validado com membership | Estrita (Zod / JSON) | ✅ LLM Guard ($0.25/dia) | ✅ Hash SHA-256 | **SAFE** |
| `/api/cognitive/consent` | POST | `auth.getUser()` | Colaborador | Sessão / Membership | Estrita | Standard | ✅ `consent_given_at` | **SAFE** |
| `/api/interventions/[id]/evidence` | POST | `auth.getUser()` | Admin, RH, SST | RLS / Membership | Multipart / MIME | Standard | ✅ `action_audit_logs` | **NEEDS HARDENING** (Magic bytes) |
| `/api/interventions/[id]/reassess` | POST | `auth.getUser()` | SST, Admin, RH | RLS / Membership | JSON payload | Standard | ✅ `action_audit_logs` | **SAFE** |
| `/api/interventions` | GET, POST | `auth.getUser()` | Admin, RH, SST | Contexto de Tenant seguro | JSON payload | Standard | ✅ `action_audit_logs` | **SAFE** |
| `/api/campaigns` | GET, POST | `auth.getUser()` | Admin, RH | Contexto de Tenant seguro | JSON payload | Standard | ✅ Audit log | **SAFE** |
| `/api/campaigns/[id]/aggregates` | GET | `auth.getUser()` | Admin, RH, Manager | RLS / Filtro $N \ge 5$ | UUID param | Standard | Read-only audit | **SAFE** ($N \ge 5$ mascarado) |
| `/api/reports` | GET | `auth.getUser()` | Admin, RH, DPO, SST | Contexto de Tenant seguro | Query params | Standard | Read-only audit | **SAFE** |
| `/api/reports/[id]` | GET | `auth.getUser()` | Admin, RH, DPO, SST | RLS / Membership | UUID param | Standard | ✅ `report_audit_logs` | **SAFE** |
| `/api/reports/generate` | POST | `auth.getUser()` | Admin, SST, RH | Contexto de Tenant seguro | JSON payload | Standard | ✅ `report_audit_logs` | **SAFE** (SHA-256 assinado) |
| `/api/ai/decisions/[id]/validate` | POST | `auth.getUser()` | SST, Médico, Auditor | RLS / Role check | JSON payload | Standard | ✅ `ai_audit_logs` | **SAFE** (Human-in-the-loop) |
| `/api/ai/governance` | GET | `auth.getUser()` | Admin, DPO, SST | Contexto de Tenant seguro | Query params | Standard | Read-only audit | **SAFE** |
| `/api/assessments/submit` | POST | Token / Session | Colaborador / Participante | Token seguro de campanha | JSON payload | Standard | ✅ Assessment log | **SAFE** |
| `/api/assessment/score` | POST | Session | SST, Backend Worker | Contexto de Tenant seguro | JSON payload | Standard | ✅ Score calculation | **SAFE** |
| `/api/manager/overview` | GET | `auth.getUser()` | Manager, Admin, RH | Contexto de Tenant seguro | Query params | Standard | Read-only audit | **SAFE** |
| `/api/rh/overview` | GET | `auth.getUser()` | RH, Admin | Contexto de Tenant seguro | Query params | Standard | Read-only audit | **SAFE** |
| `/api/rh-pilot` | GET | `auth.getUser()` | RH, Admin | Contexto de Tenant seguro | Query params | Standard | Read-only audit | **SAFE** |
| `/api/voice/process` | POST | `auth.getUser()` | Colaborador / SST | Contexto de Tenant seguro | Audio buffer | Standard | Hash acústico | **NEEDS HARDENING** (Rate-limit) |

---

## 2. INVENTÁRIO DE SERVER ACTIONS (`"use server"`)

| Arquivo de Ação | Funções Exportadas | Autenticação | RBAC | Resolução de Tenant | Proteção CSRF / Origin | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `apps/web/app/admin/actions/workspace.ts` | `switchOrganizationAction`, `getUserOrganizationsAction` | `auth.getUser()` | Membro ativo | Anti-IDOR via `getUserMemberships` | Next.js Server Action token | **SAFE** |
| `apps/web/app/admin/actions/reports.ts` | `generateReportAction`, `exportReportAction` | `auth.getUser()` | Admin, RH, SST | `resolveTenantContext` | Next.js Server Action token | **SAFE** |
| `apps/web/app/admin/actions/interventions.ts` | `createInterventionAction`, `updateStatusAction` | `auth.getUser()` | Admin, RH, SST | `resolveTenantContext` | Next.js Server Action token | **SAFE** |
| `apps/web/app/admin/ai-governance/actions.ts` | `validateAiDecisionAction` | `auth.getUser()` | SST, Admin, DPO | `resolveTenantContext` | Next.js Server Action token | **SAFE** |
| `apps/web/app/employee/cognitive/actions.ts` | `submitConsent`, `saveTask`, `toggleBenefit` | `auth.getUser()` | Granular por ação | `auth.uid()` / Admin check | Next.js Server Action token | **SAFE** |
| `apps/web/app/admin/campaigns/actions.ts` | `createCampaignAction`, `closeCampaignAction` | `auth.getUser()` | Admin, RH | `resolveTenantContext` | Next.js Server Action token | **SAFE** |
| `apps/web/app/admin/team/actions.ts` | `inviteEmployeeAction`, `removeEmployeeAction` | `auth.getUser()` | Admin, RH | `resolveTenantContext` | Next.js Server Action token | **SAFE** |
| `apps/web/app/admin/compliance/actions.ts` | `exportComplianceAuditAction` | `auth.getUser()` | Admin, DPO, Auditor | `resolveTenantContext` | Next.js Server Action token | **SAFE** |
| `apps/web/app/auth/actions.ts` | `loginAction`, `signupAction`, `resetPasswordAction` | Anônimo / Auth | Público | N/A | Next.js Server Action token | **SAFE** |
| `apps/web/app/sos/actions.ts` | `requestUrgentSupportAction` | `auth.getUser()` | Colaborador | `auth.uid()` | Next.js Server Action token | **SAFE** |
