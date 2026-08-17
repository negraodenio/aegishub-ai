# AEGISHUB AI — VOICE MODULE CURRENT STATE AUDIT
## P5.3 Pre-Implementation Discovery

**Date:** 2026-08-17  
**Auditor:** Principal AI Architect  
**Baseline:** 401/401 tests PASS, 0 TypeScript errors, build PASS  
**Mode:** READ-ONLY AUDIT  

---

## COMPONENT STATUS MATRIX

| Component | File | Status | Detail |
| :--- | :--- | :---: | :--- |
| **Frontend Recording** | `VoiceSessionUI.tsx` | ✅ REAL | `navigator.mediaDevices.getUserMedia` + `MediaRecorder` — real audio capture |
| **Audio Upload to Storage** | `VoiceSessionUI.tsx:47-55` | ✅ REAL | Uploads WebM blob to Supabase Storage bucket `voice-assessments` |
| **Storage Bucket** | `20260404_storage_setup.sql` | ✅ REAL | Bucket `voice-assessments` exists, private, RLS policies present |
| **Waveform Visualizer** | `VoiceSessionUI.tsx:123-134` | 🔴 MOCK | `Math.random()` — simulated bars, NOT real audio signal data |
| **Acoustic Analysis Backend** | `route.ts:60-68` | 🔴 MOCK | Hardcoded object: `prosody:"moderate_stress"`, `score:0.65`, `jitter:0.015`, `shimmer:0.25` — NOT computed from audio |
| **Emotional Classification** | `route.ts:61` | 🔴 SECURITY RISK | `prosody: "moderate_stress"` is an emotional/stress inference — violates EU AI Act Art. 5 |
| **voice_features table** | `20260404_voice_technical_schema.sql` | ✅ REAL (schema) | Table exists with correct columns (jitter_local, shimmer_local, f0_mean, etc.) |
| **voice_features population** | All `.ts` files | 🔴 MISSING | NO code anywhere writes to `voice_features` after processing — table is always empty |
| **voice_scores table** | `20260404_voice_technical_schema.sql` | ✅ REAL (schema) | Table exists with `vocal_load_score`, `confidence_score` |
| **voice_scores population** | All `.ts` files | 🔴 MISSING | NO code writes to `voice_scores` — always empty |
| **voice_sessions table** | `20260404_voice_technical_schema.sql` | ✅ REAL (schema) | Table exists |
| **voice_sessions population** | All `.ts` files | 🔴 MISSING | `audio_path` is stored in `assessment_scores.voice_path` only — `voice_sessions` not written |
| **consent_logs table** | `20260404_consent_storage.sql` | ✅ REAL | Table exists, consent is recorded via `submitConsentAction` |
| **consent_logs RLS** | `20260404_consent_storage.sql:17` | 🔴 SECURITY RISK | `ALTER TABLE consent_logs DISABLE ROW LEVEL SECURITY` — cross-tenant read is possible |
| **voice_features RLS** | `20260404_voice_technical_schema.sql` | 🔴 MISSING | No RLS enabled on voice_features, voice_scores, voice_audit_log |
| **Consent Flow (Frontend)** | `WorkerWizard.tsx:20,105-106` | ✅ REAL | `voice_biometrics` checkbox gated before voice step |
| **Consent Granularity** | `WorkerWizard.tsx:53,78` | ✅ REAL | Separate `psychosocial_processing` and `voice_technical_analysis` consent types |
| **Rate Limiter** | `rate-limiter.ts:104-108` | ✅ REAL | `voiceRateLimiter`: 10 req/min, Token Bucket, per-employeeId |
| **Authentication** | `route.ts:10-20` | ✅ REAL | Bearer token via `verifyAssessmentToken` |
| **Session Ownership** | `route.ts:47-57` | ✅ REAL | `.eq("employee_id", employeeId)` anti-IDOR check |
| **Raw Audio Retention** | `VoiceSessionUI.tsx:44-49` | 🟡 PARTIAL | Audio uploaded to Storage indefinitely — NO TTL, NO auto-delete after processing |
| **Privacy Deletion Endpoint** | `api/privacy/me` | ✅ REAL | Exists but does NOT explicitly delete voice storage objects |
| **HR Individual Voice Access** | `ActionQueueTable.tsx:58-65` | 🔴 SECURITY RISK | HR dashboard has `Ouvir` button linking directly to individual voice file in public storage |
| **Manager Individual Access** | (none found) | ✅ REAL | No manager-specific individual voice access found |
| **Text-Only Fallback** | `WorkerWizard.tsx:107-109` | ✅ REAL | If `voice_biometrics=false`, skips voice step |
| **Fail-Safe on Error** | `route.ts:75-83` | ✅ REAL | catch returns 500 with text-fallback message |
| **OpenSMILE / ML Engine** | (entire codebase) | 🔴 MISSING | No audio processing library installed or referenced |
| **Autocorrelation / Pitch** | (entire codebase) | 🔴 MISSING | No DSP code exists |
| **Individual Baseline** | (entire codebase) | 🔴 MISSING | No longitudinal baseline system exists |
| **Audio Format Validation** | `route.ts` | 🔴 MISSING | `audioData` is accepted but never validated for format, size, or corruption |

---

## CRITICAL ISSUES (Must Fix Before Any Commercial Use)

### 🔴 CRITICAL-1: Emotional/Stress Classification (EU AI Act Art. 5 Violation Risk)
```typescript
// route.ts line 61 — MUST BE REMOVED
prosody: "moderate_stress"  // This is an emotional inference — prohibited in workplace AI
```
**Fix:** Remove entirely. Return `NOT_ANALYZED` or real acoustic measurements only.

### 🔴 CRITICAL-2: Hardcoded Fake Measurements
```typescript
// route.ts lines 63-67 — MUST BE REMOVED
score: 0.65,
metrics: { jitter: 0.015, shimmer: 0.25 }
```
All 401 employees receive identical values. This is not analysis — it is fabrication.

### 🔴 CRITICAL-3: RLS Disabled on consent_logs
```sql
ALTER TABLE consent_logs DISABLE ROW LEVEL SECURITY;  -- line 17
```
Any authenticated user can read/modify any other tenant's consent records.

### 🔴 CRITICAL-4: HR Can Listen to Individual Voice Recordings
`ActionQueueTable.tsx:60` creates a direct public URL to individual employee voice files. This violates:
- LGPD Art. 7/11 (individual voice data accessible to non-authorized parties)
- RGPD Art. 9 (biometric data must not be exposed to HR without explicit justification)

### 🟡 MEDIUM-1: voice_features/voice_scores Never Populated
Database schema exists but is never written to. Acoustic features are not persisted anywhere.

### 🟡 MEDIUM-2: Raw Audio Retained Indefinitely
No TTL or auto-delete policy after the recording is "processed".

---

## WHAT IS GENUINELY WORKING

1. ✅ Real audio recording (Web Audio API + MediaRecorder)
2. ✅ Real upload to Supabase Storage bucket
3. ✅ Real consent granularity (checkbox gated)
4. ✅ Real rate limiting (Token Bucket)
5. ✅ Real authentication and session ownership checks
6. ✅ Real text-only fallback
7. ✅ Real fail-safe on error

---

## WHAT MUST BE IMPLEMENTED (P5.3)

1. 🔧 Real acoustic feature extraction engine (browser-side: Web Audio API)
2. 🔧 Remove emotional classification (`prosody: "moderate_stress"`)  
3. 🔧 Enable RLS on consent_logs, voice_features, voice_scores, voice_audit_log
4. 🔧 Remove HR individual voice access button from ActionQueueTable
5. 🔧 Populate voice_features table with real extracted data
6. 🔧 Add audio TTL / auto-delete policy
7. 🔧 Add audio format and quality validation
8. 🔧 Add privacy deletion for voice storage objects
9. 🔧 Replace Math.random() waveform with real AnalyserNode data
10. 🔧 Return `NOT_ANALYZED` when engine cannot compute real results
