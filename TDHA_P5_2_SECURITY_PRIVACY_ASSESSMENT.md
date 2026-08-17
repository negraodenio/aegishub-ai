# AEGISHUB AI — P5.2 SECURITY, PRIVACY & CLINICAL BOUNDARY ASSESSMENT
**Regulatory Compliance:** RGPD (EU 2016/679), LGPD (Lei 13.709/2018), EU AI Act (Regulation 2024/1689)  
**Auditor Engine:** Gemini 3.7 Flash  
**Date:** 2026-08-16  

---

## 1. Legacy Architecture Remediation Strategy

To preserve AegisHub's security baseline (346/346 tests PASS, zero IDOR, zero unsafe client tenantId flows), **NO legacy TDHA code will be copied directly**. Every capability admitted to P5.2 is classified under a strict engineering migration taxonomy:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     P5.2 CODE MIGRATION TAXONOMY                         │
├──────────────────────────────────────────────────────────────────────────┤
│ • REUSE:    Domain math or pure UI primitives (e.g. MEQ-5 scoring table) │
│ • REFACTOR: Transform single-tenant logic into multi-tenant repositories │
│ • REWRITE:  Build completely from scratch on the AegisHub API pipeline    │
│ • DISCARD:  Reject entirely (consumer finance, B2C Stripe, dev tooling)  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Capability Transformation Table

| Capability | Legacy Source in TDHA | Architectural Strategy | AegisHub Security Controls to Enforce |
| :--- | :--- | :---: | :--- |
| **MEQ-5 Chronotype Assessment** | `components/MEQ5Questionnaire.tsx` | **REWRITE** | Store in `cognitive_user_profiles.chronotype`; wrap in `resolveAuthorizedTenantContext` and RLS `auth.uid() = user_id`. |
| **Context Recovery / Decompression** | Conceptual in `docs/` | **REWRITE** | Server route `/api/cognitive/recovery`; enforce consent, quota lease ($0.005/call), non-clinical prompt. |
| **Energy-Match Prioritization** | Conceptual | **REWRITE** | Algorithmic client/server sorting; zero exposure of raw energy checkpoints to manager/HR. |
| **Meeting Preparation & Offloader** | Conceptual | **REWRITE** | Route `/api/cognitive/meetings/prepare`; pre-flight PII scrubber, SHA-256 HMAC audit, output validator. |
| **Checklist / SOP Generator** | Conceptual | **REWRITE** | Route `/api/cognitive/templates/generate`; plan entitlement gate (`cognitive_support`), token rate limiting. |
| **Duty / Personal Life Admin** | `actions/duty.ts`, `duty_schema.sql` | **DISCARD** | Completely rejected to avoid consumer financial data liability in B2B environments. |
| **Coding Memory Vector RAG** | `intelligence_schema.sql` | **DISCARD** | Completely rejected as developer tooling outside user cognitive scope. |

---

## 2. Clinical Boundary Enforcement & De-Clinicalization

AegisHub AI operates exclusively as a **Workplace Ergonomics & Universal Executive Function Platform**. Under no circumstances does it perform medical diagnosis, psychiatric evaluation, or clinical treatment.

### 2.1 Forbidden Clinical Vocabulary
The following clinical terms are permanently blacklisted from prompts, UI labels, and runtime outputs:

$$\text{Forbidden Terms} = \begin{Bmatrix}
\text{diagnóstico}, \text{diagnosticado}, \text{você sofre de}, \text{você tem TDAH}, \text{você tem TEA}, \\
\text{transtorno mental}, \text{prescrição}, \text{medicamento}, \text{remédio}, \text{Ritalina}, \text{Venvanse}, \\
\text{CID-10}, \text{CID-11}, \text{DSM-5}, \text{patologia}, \text{doença mental}, \text{terapia clínica}
\end{Bmatrix}$$

### 2.2 Re-framing Strategy for Enterprise
- **Scientific Chronobiology:** MEQ-5 is presented as a *Circadian Productivity Preference* (Morning/Evening peak hours) based on chronobiology research, NOT a neurological diagnosis.
- **Task Decomposition:** Presented as an *Executive Planning Tool* for breaking down complex deliverables, NOT a treatment for ADHD paralysis.
- **Decompression Flow:** Presented as *Focus Reorientation & Mental Reset*, NOT psychotherapy or clinical grounding.

---

## 3. Enterprise Privacy & Role-Based Access Control (RBAC) Matrix

To guarantee zero employer surveillance and protect sensitive worker cognitive state data under RGPD Article 9 and LGPD Article 11, data visibility is strictly segregated across platform roles:

| Data Element | Employee (Owner) | Team Manager | HR / SST Leader | Tenant Admin | Platform Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Task Titles & Notes** | ✅ Full Read/Write | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS |
| **Focus Intervals & Times** | ✅ Full Visibility | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS |
| **Daily Energy Check-Ins** | ✅ Full Visibility | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS |
| **Chronotype (MEQ-5)** | ✅ Full Visibility | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS |
| **Stuck Mode Activations** | ✅ Full Visibility | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS |
| **Meeting Notes / Prep** | ✅ Full Visibility | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS |
| **Aggregated Benefit Rate** | ℹ️ Self Stats Only | ℹ️ Aggregated ($N \ge 20$) | ✅ Aggregated ($N \ge 20$) | ℹ️ Aggregated ($N \ge 20$) | ❌ NO ACCESS |
| **Module Seat License Status** | ℹ️ Enabled/Disabled | ❌ NO ACCESS | ✅ Team Seats Total | ✅ Manage Subscription | ❌ NO ACCESS |
| **Cryptographic Audit Logs** | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ❌ NO ACCESS | ✅ SHA-256 Hashes Only |

---

## 4. Aggregation Privacy Mathematical Rule ($N \ge 20$)

In B2B organizational analytics (HR and SST compliance dashboards), employee participation and productivity improvements are reported strictly as anonymous cohorts:

$$\text{Cohort Metric Visibility} = \begin{cases} 
\text{Report Aggregates (\% Adoption, Total Focus Hours)}, & \text{if } N_{\text{active users}} \ge 20 \\
\text{SUPPRESSED (NULL / "Dados Insuficientes para Privacidade")}, & \text{if } N_{\text{active users}} < 20 
\end{cases}$$

This mathematical threshold prevents re-identification attacks, reverse-engineering of individual work patterns, or differential privacy leakage in small departments or teams.
