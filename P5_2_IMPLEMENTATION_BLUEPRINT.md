# AEGISHUB AI — P5.2 COGNITIVE ACCESSIBILITY EXPANSION BLUEPRINT
**Phase:** P5.2 Architecture, Schema & Implementation Blueprint  
**Status:** SPECIFICATION & DISCOVERY ONLY (Zero Code Applied)  
**Baseline Test Suite Target:** 346 current tests $\rightarrow$ ~371 additive tests (100% Pass)  
**Date:** 2026-08-16  

---

## 1. Product Definition & Strategic Identity

### 1.1 Platform Mission
> **AegisHub Cognitive Accessibility Suite** is an enterprise-grade, universal executive function prosthetic designed to eliminate task paralysis, prevent cognitive fatigue, and restore mental clarity for modern knowledge workers, while providing organizations with mathematical privacy and psychosocial regulatory compliance.

### 1.2 Target Audience
- **Enterprise Knowledge Workers:** Individual contributors experiencing cognitive overload, attention fragmentation, or task initiation friction.
- **Corporate HR & Health (SST) Leaders:** Organizations complying with European psychosocial health directives, EU Accessibility Act 2025, and Brazilian NR-1/NR-17 ergonomic standards.
- **Public Administration & Tender Bodies:** Government agencies requiring accessible, non-discriminatory digital workplace tools without clinical stigmatization.

---

## 2. Core User Journey & Interaction Loop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 AEGISHUB COGNITIVE WORKSPACE CORE LOOP                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. CHECK-IN:      Quick 1-10 Energy Check-In (Optional MEQ-5 Profile)       │
│ 2. CAPTURE:       Frictionless Daily Wins (Inline quick-capture)            │
│ 3. MATCH:         Adaptive Sorting (Low energy -> Micro tasks; High -> Deep)│
│ 4. DECOMPOSE:     AI Task Breakdown (Overwhelming task -> 3-5 micro steps)  │
│ 5. RECOVER:       Context Recovery Flow (2-min guided reorientation)        │
│ 6. FOCUS:         Honest Focus Window Timer (5m, 10m, 25m)                  │
│ 7. SPIRAL BREAK:  Grounding & Stuck Mode (4-4-4-4 breathing + 10s micro-win)│
│ 8. EVIDENCE:      Weekly Progress Dashboard (Evidence of positive momentum) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. P5.2 Proposed Architecture & Components

### 3.1 Proposed Database Migration
**File:** `supabase/migrations/20260819_cognitive_accessibility_expansion_p5_2.sql`

```sql
-- P5.2 Expansion Schema: Context Recovery & Meeting Preps

-- 1. Context Recovery Checkpoints (Private to user)
CREATE TABLE IF NOT EXISTS public.cognitive_context_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.cognitive_tasks(id) ON DELETE SET NULL,
  last_working_state TEXT NOT NULL,
  next_micro_action TEXT NOT NULL,
  interruption_source TEXT DEFAULT 'meeting' CHECK (interruption_source IN ('meeting', 'break', 'switch', 'end_of_day')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Meeting Cognitive Offloader (Private to user)
CREATE TABLE IF NOT EXISTS public.cognitive_meeting_preps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_title TEXT NOT NULL,
  key_objectives TEXT[] NOT NULL DEFAULT '{}',
  questions_to_ask TEXT[] NOT NULL DEFAULT '{}',
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cognitive_context_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_meeting_preps ENABLE ROW LEVEL SECURITY;

-- Owner-only RLS policies with Tenant Membership Validation
CREATE POLICY "Users can manage own checkpoints in active tenant"
  ON public.cognitive_context_checkpoints
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND public.is_active_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Users can manage own meeting preps in active tenant"
  ON public.cognitive_meeting_preps
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND public.is_active_tenant_member(auth.uid(), tenant_id));
```

### 3.2 Proposed API Endpoints (`apps/web/app/api/cognitive/`)
1. **`POST /api/cognitive/recovery/checkpoint`**: Saves an active working state and next micro-action before an interruption or meeting.
2. **`GET /api/cognitive/recovery/resume`**: Retrieves the last checkpoint to guide a 2-minute re-entry flow.
3. **`POST /api/cognitive/meetings/prepare`**: AI-assisted preparation taking raw meeting descriptions/agendas and generating structured objectives and next actions.
4. **`POST /api/cognitive/chronotype/assess`**: Computes and persists the MEQ-5 score and assigns one of 4 circadian profiles (`lion`, `bear`, `wolf`, `dolphin`).

### 3.3 Proposed UI Components (`apps/web/features/cognitive/components/`)
1. `ContextRecoveryModal.tsx`: Re-orientation dialogue showing last state, 3 breaths, and immediate next micro-step.
2. `MeetingPrepCard.tsx`: Frictionless meeting organizer extracting focus points and post-meeting checklist items.
3. `MEQ5AssessmentModal.tsx`: Scientific 5-item questionnaire modal with visual circadian curve output.
4. `EnergySortToggle.tsx`: Smart task filter sorting tasks by matching energy requirements.

---

## 4. Test Plan & Quality Assurance (Additive Suite)

| Test Category | Target Scenarios | Projected New Tests | Target Baseline |
| :--- | :--- | :---: | :---: |
| **Existing Baseline** | P0 through P5.1 (Full Regression) | 346 tests | 346 Passed |
| **MEQ-5 Scoring Unit Tests** | Valid score ranges (4-25), boundary tests, tie-breaking, circadian profile mapping | +5 tests | 351 Passed |
| **Context Recovery API Tests** | Save checkpoint, resume last state, tenant validation, IDOR block | +5 tests | 356 Passed |
| **Meeting Prep LLM Guard Tests** | Token lease reservation, PII scrubber, delta cost reconciliation | +5 tests | 361 Passed |
| **RLS & Multi-Tenant Tests** | Checkpoint cross-tenant insert block, meeting prep cross-user read block | +5 tests | 366 Passed |
| **Energy Matching Logic Tests** | Low energy sort ($\le 4$), peak energy sort ($\ge 7$), neutral fallback | +5 tests | 371 Passed |
| **TOTAL PROJECTED SUITE** | **Complete AegisHub Test Harness** | **~371 tests** | **100% PASS** |

---

## 5. Architectural Decision & Final Recommendation

```
========================================================================
FINAL P5.2 RECOMMENDATION: GO WITH CONDITIONS
========================================================================
```

### 5.1 Conditions for Execution
1. **Zero Legacy Copy-Paste:** All new endpoints must adhere 100% to the enterprise pipeline (`resolveAuthorizedTenantContext`, commercial entitlement, consent, atomic quota lease, output safety, two-phase audit).
2. **Strict Additive Migrations:** Zero modifications to existing committed SQL migrations. All schema additions must reside in new timestamped migration files.
3. **Preserve Baseline:** The existing 346 Vitest tests, Turbo typecheck (0 errors), and Next.js build must pass at every development step.

### 5.2 Implementation Phasing

#### Phase 1: Implement First (Top 4 Capabilities)
1. **Scientific MEQ-5 Chronotype Profiler UI & Persistence:** Complete the partially integrated circadian assessment.
2. **Context Recovery & Decompression Flow:** High-impact tender differentiator for cognitive re-entry.
3. **Adaptive Energy-Match Task Prioritization:** Frictionless client-side sorting connecting energy check-ins with task execution.
4. **Meeting Preparation & Action Offloader:** AI assistant turning calendar chaos into clear micro-steps.

#### Phase 2: Implement Later (Future P5.3 Roadmap)
1. **Checklist & Corporate SOP Generator:** Reusable workflow templates.
2. **Adaptive Notification Scheduling:** Non-intrusive focus nudge engine.
3. **Voice Memo to Decomposed Tasks:** Multimodal transcription and task breakdown.

#### Phase 3: Do Not Implement (Permanently Rejected)
1. **Duty / B2C Personal Finance & Bills Ledger:** Out of scope and privacy liability.
2. **Developer Coding Memory Vector RAG:** Internal developer tooling only.
3. **Stripe B2C Consumer Checkout:** Incompatible with B2B multi-tenant licensing.
