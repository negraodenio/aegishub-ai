# AEGISHUB AI — P5.2 COGNITIVE UNSTUCK CHAT + RAG
## PHASE 0: DISCOVERY & KNOWLEDGE BASE AUDIT REPORT
**Role:** Principal AI Architect, RAG Architect, Security Architect & Privacy Engineer  
**Date:** 2026-08-16  
**Status:** READ-ONLY DISCOVERY COMPLETE (Zero Code Changes)  

---

## 1. Executive Summary & Verified Baseline

The AegisHub AI repository was audited to establish the architectural foundation for the **P5.2 Cognitive Unstuck Chat + RAG**.

### 1.1 Verified Platform Baseline
- **Git Branch:** `main` (commit `9042a94`)
- **Automated Test Suite:** **346/346 tests PASS** across 18 test suites (0 failed, 0 skipped)
- **TypeScript Typecheck:** **0 errors** across all 8 monorepo workspaces (`turbo typecheck`)
- **Production Build:** **PASS** (28 static/dynamic routes compiled cleanly in Next.js 15.5.14)
- **Multi-Tenant Security:** Server-side `resolveAuthorizedTenantContext`, fail-closed `checkFeatureEntitlement("cognitive_support")`, dual RGPD/LGPD consent, atomic quota lease ($0.25/day per user), delta reconciliation (`reconcile_llm_usage`), RLS tenant membership verification (`is_active_tenant_member`), and $N \ge 20$ aggregation privacy.

---

## 2. Codebase Infrastructure Inspection

### 2.1 Existing Cognitive Architecture (`apps/web/app/api/cognitive/`)
- `/api/cognitive/chief/chat`: Session-only executive chat prototype enforcing tenant context, consent, entitlement, and audit capability minting.
- `/api/cognitive/tasks/decompose`: Task breakdown pipeline with atomic LLM lease, PII detector, and clinical output guardrails.
- `/api/cognitive/chief/tip`: Multi-language (PT/BR/EN) in-memory cached tip engine with zero quota consumption on cache hits.
- `/api/cognitive/focus/*`: Session start, end, and heartbeat with database ownership validation.
- `/api/cognitive/stuck`: 4-step spiral interrupter logging telemetry events (`cognitive_support_events`).

### 2.2 Frontend Cognitive Components (`apps/web/features/cognitive/components/`)
- `CognitiveAIChat.tsx`: Floating chat modal listening to global `cognitive:open-chat` event with session-only state.
- `FocusTimer.tsx`: Visual focus window timer (5m, 10m, 25m presets).
- `CognitiveStuckFlow.tsx`: Box breathing (4-4-4-4) and 10-second micro-action countdown.
- `EnergyCheckIn.tsx`: 1-10 daily energy check-in slider.
- `CognitiveWeeklyProgress.tsx`: User-scoped gains evidence dashboard.

### 2.3 Vector Database & Embeddings Infrastructure
- **PostgreSQL Extension:** `vector` (pgvector) is **already enabled** in `supabase/migrations/0001_init.sql` (`create extension if not exists "vector";`).
- **Embedding Standard:** Standard 1536-dimensional float vector embeddings, natively supported by pgvector for cosine similarity (`<=>`), inner product (`<#>`), and L2 distance (`<->`).
- **Conclusion:** No external vector database (e.g. Pinecone, Weaviate, Qdrant) is needed. AegisHub will natively leverage **pgvector** within PostgreSQL/Supabase.

### 2.4 AI Governance & Audit Infrastructure (`packages/ai-core`)
- `LLMGuardSession`: Atomic lease acquisition with PII detection (`containsSensitiveData`), rate limits, and token budgets.
- `TwoPhaseAuditManager`: Cryptographic two-phase audit minting HMAC-SHA256 tokens (`payloadHash`) to prevent plaintext log leakage.
- `LlmGuardUsageTracker`: Enforces a $0.25/day budget ceiling and clinical blocklist validation (`validateCognitiveOutput`).

---

## 3. TDHA Material Inventory & Source Classification

The documentation and code in `TDHA/docs/` and `TDHA/my-app/` were audited to create the **Cognitive Support Knowledge Base**. Every piece of source content is classified into one of four categories:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   RAG KNOWLEDGE SOURCE CLASSIFICATION                    │
├──────────────────────────────────────────────────────────────────────────┤
│ • KEEP:    Universal workplace productivity strategies & math formulas    │
│ • REFRAME: De-clinicalize ADHD/clinical content into executive ergonomics │
│ • REVIEW:  Empirical research papers requiring extraction of principles  │
│ • REJECT:  Diagnostic tools, medical claims, medication references, B2C  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Document Classification Table

| Source File / Resource | Original Focus | Classification | Target RAG Topic | Strategy / Transformation Required |
| :--- | :--- | :---: | :--- | :--- |
| `TDHA/docs/Adan_Almirall_1991.pdf` | MEQ-5 Morningness-Eveningness Scale | **KEEP** | `chronotype_energy_matching` | Extract validated 5-question scoring math (4-25 scale) and circadian peak hours (Morning, Intermediate, Evening). |
| `TDHA/docs/Overcoming Decision Fatigue...pdf` | Psychological decision fatigue | **REFRAME** | `decision_simplification` | Strip clinical ADHD mentions; extract the "Rule of 3 Choices", default action heuristics, and binary decision trees. |
| `TDHA/docs/Unlocking Your Productivity...pdf` | Chronotypes & workplace performance | **REFRAME** | `energy_aware_scheduling` | Reframe into workplace scheduling: Deep Work during biological peak, Administrative/Routine tasks during trough. |
| `TDHA/docs/DOC3.pdf` & `S0924933825014178a.pdf` | Executive function & task initiation | **REFRAME** | `task_initiation_micro_actions` | Extract the "2-Minute Starting Rule", "Visual Anchoring", and "Friction Reduction" heuristics. |
| `TDHA/my-app/lib/chief-tip-cache.ts` | 50+ Tactical productivity tips | **KEEP** | `quick_tactical_tips` | Clean, high-impact workplace focus and decompression tips in Portuguese and English. |
| `TDHA/my-app/components/stuck-modal.tsx` | Grounding & Spiral Breaker | **KEEP** | `interruption_context_recovery` | Box Breathing (4-4-4-4), barrier naming (Overwhelm, Distraction, Low Energy), and 10s micro-action commitments. |
| `TDHA/my-app/app/actions/breakdown.ts` | Task decomposition prompt | **REFRAME** | `task_decomposition_patterns` | Remove `"assistant for adults with ADHD"`; frame as structured workplace executive decomposition into 3-5 sub-steps. |
| `TDHA/docs/Accessing Europe's DiGA...pdf` | German BfArM medical reimbursement | **REJECT** | N/A | **REJECTED**: Purely clinical regulatory reimbursement document. Not applicable to B2B SaaS. |
| `TDHA/docs/nihms-2028939.pdf` | Clinical pharmacological trials | **REJECT** | N/A | **REJECTED**: Contains medication, clinical pathology, and psychiatric trial data. |
| `TDHA/my-app/duty_schema.sql` | Personal BRL bills & bank balance | **REJECT** | N/A | **REJECTED**: Personal consumer finance is out of scope for enterprise B2B. |
| `TDHA/my-app/intelligence_schema.sql` | Developer code vector RAG | **REJECT** | N/A | **REJECTED**: Developer tooling, completely irrelevant to employee cognitive support. |

---

## 4. Unsafe Content Quarantine & Clinical Boundaries

The following content is **strictly quarantined** and forbidden from entering the RAG embedding pipeline:

1. **Medical & Diagnostic Content:** DSM-5 criteria, ICD-10/11 codes, psychiatric pathology definitions.
2. **Medication & Treatment Content:** Ritalin, Methylphenidate, Vyvanse, Adderall, Atomoxetine, dosage, side effects, pharmacological therapies.
3. **Clinical Psychotherapy Content:** Cognitive Behavioral Therapy (CBT) protocols for clinical depression, trauma processing, crisis helpline impersonation.
4. **Employer Surveillance Prompts:** Prompts attempting to evaluate worker competence, psychological fitness, or burnout profiling for HR/managers.

---

## 5. Discovery Findings Summary

1. **Native pgvector:** AegisHub has `vector` extension already enabled in Supabase migrations, ready for a dedicated `cognitive_knowledge_chunks` table.
2. **Deterministic Context:** RAG documents will serve as strict, untrusted data injected into a sandboxed prompt segment, guarded by pre-flight PII scanning and post-flight clinical output validation.
3. **Conversational Focus:** The engine will implement a 7-state finite state machine optimizing for **Action & Clarity** over conversation length.
