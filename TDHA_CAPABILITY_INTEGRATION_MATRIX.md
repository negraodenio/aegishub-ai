# AEGISHUB AI — TDHA CAPABILITY INTEGRATION MATRIX
**Scope:** Real Codebase Mapping between `TDHA/my-app` and `AegisHub AI`  
**Date:** 2026-08-16  
**Auditor Engine:** Gemini 3.7 Flash  

---

## 1. Master Capability Matrix

| # | TDHA Capability | TDHA Original File(s) | AegisHub Status | AegisHub Implementation File(s) | Decision & Technical Rationale |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **01** | **Task Decomposition** (Breakdown to 3-5 micro-steps) | `TDHA/my-app/app/actions/breakdown.ts` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/tasks/decompose/route.ts`<br>`apps/web/features/cognitive/components/CognitiveExecutiveWorkspace.tsx` | Rewritten with full enterprise pipeline (tenant resolution, quota lease, output validator, non-clinical prompt). |
| **02** | **The Chief AI Chat** (Unblock conversational agent) | `TDHA/my-app/app/actions/chief.ts`<br>`TDHA/my-app/components/SOSChat.tsx` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/chief/chat/route.ts`<br>`apps/web/features/cognitive/components/CognitiveAIChat.tsx` | Integrated with strict server-side tenant resolution, fail-closed atomic quota ($0.25/day), and delta reconciliation. |
| **03** | **Daily Tactical Tip** (24h cached productivity tip) | `TDHA/my-app/app/actions/chief.ts`<br>`TDHA/my-app/components/ChiefTip.tsx` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/chief/tip/route.ts`<br>`apps/web/features/cognitive/components/CognitiveDailyTip.tsx` | In-memory 24h caching, multi-language support (PT/BR/EN), zero quota spend on hit, de-clinicalized tips. |
| **04** | **Focus Window Timer** (Honest focus intervals: 5/10/25m) | `TDHA/my-app/components/HeroCard.tsx`<br>`TDHA/my-app/app/actions/timer.ts` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/focus/start/route.ts`<br>`apps/web/app/api/cognitive/focus/end/route.ts`<br>`apps/web/app/api/cognitive/focus/ping/route.ts`<br>`apps/web/features/cognitive/components/FocusTimer.tsx` | Implemented with database RLS ownership checks, anti-IDOR session validation, and multi-preset timers. |
| **05** | **Stuck / Grounding Mode** (4-step spiral breaker) | `TDHA/my-app/components/stuck-modal.tsx`<br>`TDHA/my-app/app/actions/stuck.ts` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/stuck/route.ts`<br>`apps/web/features/cognitive/components/CognitiveStuckFlow.tsx` | Box Breathing (4-4-4-4), barrier naming (overwhelm, distraction, low energy), 10s micro-action timer, and audit logging. |
| **06** | **Energy Level Check-In** (Daily energy curve tracking) | `TDHA/my-app/app/actions/energy.ts` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/energy/checkin/route.ts`<br>`apps/web/features/cognitive/components/EnergyCheckIn.tsx` | Implemented as a 1-10 interactive energy level slider recording daily chronological energy checkpoints. |
| **07** | **Weekly Progress Evidence** (Week-over-week gains) | `TDHA/my-app/components/weekly-gains.tsx`<br>`TDHA/my-app/app/actions/stats.ts` | `FULLY_INTEGRATED` | `apps/web/app/api/cognitive/stats/weekly/route.ts`<br>`apps/web/features/cognitive/components/CognitiveWeeklyProgress.tsx` | Computes completed focus sessions, focus hours, and stuck resets scoped strictly to `auth.uid()`. |
| **08** | **Informed Consent Framework** (User voluntary opt-in) | `TDHA/my-app/regulatory_schema.sql` (`consents`) | `REPLACED_BY_AEGISHUB` | `apps/web/app/api/cognitive/consent/route.ts`<br>`packages/database/src/repositories/cognitive.ts` | Replaced legacy single-table consent with enterprise multi-tenant RGPD (Art. 6 & 9) / LGPD (Art. 7 & 11) consent lifecycle. |
| **09** | **MEQ-5 Chronotype Profiler** (Scientific circadian assessment) | `TDHA/my-app/components/MEQ5Questionnaire.tsx`<br>`TDHA/my-app/docs/` (Adan & Almirall, 1991) | `PARTIALLY_INTEGRATED` | Database column `cognitive_user_profiles.chronotype` exists | **P5.2 Candidate**: The backend supports storing `chronotype`, but the validated 5-question MEQ-5 assessment UI is not yet in AegisHub. |
| **10** | **Duty / Personal Life Admin** (Bills, bank balances) | `TDHA/my-app/app/actions/duty.ts`<br>`TDHA/my-app/duty_schema.sql` | `DISCARD` | N/A | **Discard**: Personal B2C banking balance and bills tracking is completely out of scope for B2B Occupational Health. |
| **11** | **Coding Memory & Repo Intelligence** (Vector code RAG) | `TDHA/my-app/intelligence_schema.sql`<br>`TDHA/my-app/lib/coding-memory-policy.ts` | `DISCARD` | N/A | **Discard**: Developer-focused code indexing tool, irrelevant to employee cognitive accessibility. |
| **12** | **Stripe B2C Consumer Checkout** | `TDHA/my-app/app/actions/stripe.ts` | `DISCARD` | N/A | **Discard**: AegisHub uses enterprise B2B Commercial Control Plane P6.6 (tenant tiers Starter/Professional/Enterprise). |
| **13** | **Context Recovery / Decompression Flow** | Conceptual in TDHA docs | `FUTURE_CANDIDATE` | *Proposed for P5.2* | **P5.2 Candidate**: Structured 2-minute post-meeting or post-interruption reorientation flow to reduce cognitive switching penalties. |
| **14** | **Energy-Match Task Prioritization** | Conceptual in TDHA chronotype notes | `FUTURE_CANDIDATE` | *Proposed for P5.2* | **P5.2 Candidate**: Dynamically sorts and suggests tasks based on the employee's current energy state (Low $\rightarrow$ Admin; High $\rightarrow$ Deep Work). |
| **15** | **Meeting Prep & Action Offloading** | Conceptual in TDHA docs | `FUTURE_CANDIDATE` | *Proposed for P5.2* | **P5.2 Candidate**: AI-assisted preparation turning messy meeting agendas/notes into clear next actions and executive bullet points. |
| **16** | **Checklist / SOP Generator** | Conceptual in TDHA task templates | `FUTURE_CANDIDATE` | *Proposed for P5.2* | **P5.2 Candidate**: Generates step-by-step Standard Operating Procedure checklists for complex recurring workplace procedures. |

---

## 2. Capability Integration Statistics

```
========================================================================
TDHA CAPABILITY AUDIT BREAKDOWN
========================================================================

Total TDHA Capabilities Audited:       16
------------------------------------------------------------------------
• Fully Integrated in P5.1:            7 (43.8%)
• Replaced by Enterprise Architecture: 1 (6.2%)
• Partially Integrated:                1 (6.2%)
• Discarded (Out of Scope / B2C):      3 (18.8%)
• P5.2 Expansion Candidates:           4 (25.0%)
========================================================================
```

---

## 3. Comparison of De-Clinicalized Terminology

| Component | TDHA Legacy Phrasing (Clinical) | AegisHub AI Enterprise Phrasing (Universal) |
| :--- | :--- | :--- |
| **System Persona** | *"Task decomposition assistant for adults with ADHD"* | *"Workplace executive function and task organization assistant"* |
| **Daily Tip Prompt** | *"Practical tip for someone with ADHD to manage a doom pile"* | *"Practical, tactical workplace productivity tip for cognitive focus"* |
| **Stuck Flow Modal** | *"Overcoming ADHD paralysis and decision fatigue"* | *"Pause the spiral: Structured grounding and micro-actions"* |
| **Target Audience** | *"Adults diagnosed with neurodivergence / TDAH / ADHD"* | *"All enterprise employees seeking executive clarity, focus and reduced cognitive load"* |
| **Legal Classification** | DiGA medical device prototype (German BfArM trial) | Workplace Ergonomics, Productivity & Cognitive Accessibility Suite (Non-medical) |
