# RELATÓRIO DE AUDITORIA ARQUITETURAL & ESTADO ATUAL (AS-IS)
## AegisHub AI — AI-Powered Psychosocial Risk Intelligence Platform

**Data da Auditoria:** 15 de Agosto de 2026  
**Auditor Responsável:** Lead Software Architect  
**Status do Sistema:** Operacional / Base de Código Unificada (Monorepo Turborepo + Next.js + Supabase)  

---

### 1. Visão Geral da Arquitetura Atual

O ecossistema **AegisHub AI** está estruturado como um monorepo gerenciado por **Turborepo** e **pnpm**, com separação lógica em pacotes de domínio (`packages/`) e aplicações executáveis (`apps/`).

```
PTSaude (Monorepo)
├── apps/
│   ├── web/               # Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion
│   └── workers/           # Background workers / cron jobs (TypeScript)
├── packages/
│   ├── ai-core/           # Guardrails clínicos, filtros de vocabulário e disclaimer wrappers
│   ├── config/            # Configurações TypeScript base compartilhadas
│   ├── database/          # Supabase client, tipos gerados, Repositories e Services
│   ├── domain/            # Regras de negócio, cálculo de scores, instrumentos e compliance
│   ├── repo-intel/        # Chunking, vector memory e patch-engine
│   └── ui/                # Componentes visuais compartilhados (Design System)
├── supabase/
│   ├── MASTER_SCHEMA.sql  # Schema SQL mestre consolidado
│   └── migrations/        # 13 migrações evolutivas (DDL, RLS, Governance, Triggers)
└── docs/                  # Guias e notas operacionais
```

---

### 2. Mapeamento Granular de Componentes & Camadas

#### 2.1 Frontend (`apps/web`)
* **Framework:** Next.js 15.x com App Router, React 19, Framer Motion, Lucide Icons, PDF rendering via `@react-pdf/renderer` e `pdfkit`.
* **Rotas de Marketing e Institucionais:**
  * `app/(marketing)/page.tsx`: Landing page comercial e de produto.
  * `app/(marketing)/ai-act/page.tsx`: Declaração de transparência e governança (EU AI Act).
  * `app/(marketing)/privacidade/page.tsx`: Política de privacidade e conformidade RGPD.
  * `app/(marketing)/suporte/page.tsx`: Suporte a compliance e canais técnicos.
* **Rotas de Autenticação:**
  * `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`, `app/auth/callback/route.ts`.
* **Rotas de Assessment / Coleta de Dados:**
  * `app/assessment/page.tsx`: Gateway de validação de token ou ativação de modo demo (`DEMO-PARTNER`).
  * `app/assessment/[token]/page.tsx`: Portal de preenchimento de questionários (`WorkerWizard.tsx` e `VoiceSessionUI.tsx`).
* **Rotas de Dashboards (Gestão, RH, SST e Clínica):**
  * `app/(dashboard)/rh/page.tsx`: Visão executiva de RH/SST (cobertura, compliance score, mapa de calor agregado, fila de ações).
  * `app/(dashboard)/rh/intelligence/page.tsx`: Intelligence Center M2.7 (Drift Matrix, Patch Feed, Human Validation Queue, RAG stream).
  * `app/(dashboard)/manager/page.tsx`: Dashboard para gestores de unidade operacional.
  * `app/(dashboard)/clinical/page.tsx`: Prontuário operacional e detalhamento individual (`AssessmentDeepDive.tsx`, `WorkerIntelligenceDossier.tsx`).
  * `app/admin/compliance/page.tsx`: Painel de conformidade organizacional e DPO (`OrganizationalHeatmap.tsx`).
  * `app/admin/ai-pilot/page.tsx`: Painel de auto-otimização e monitoramento de inferência do modelo (`AutoOptDashboard.tsx`).
  * `app/admin/team/page.tsx`: Gestão de equipa e utilizadores da organização.
* **Rotas de SOS & Denúncia (Lei 93/2021):**
  * `app/sos/page.tsx`: Portal dual (Apoio em Crise SOS vs. Canal de Denúncia confidencial).
  * `app/sos/actions.ts`: Server actions com triagem semântica via `SOSRiskEngine` e SLA de escalonamento.

#### 2.2 Backend & APIs (`apps/web/app/api`)
* `/api/assessments/submit/route.ts`: Endpoint para submissão atômica de respostas de avaliação.
* `/api/assessment/score/route.ts`: Cálculo e persistência de scores compostos.
* `/api/voice/process/route.ts`: Processamento de áudio para extração de fadiga vocal (WPM, pausas, jitter, shimmer).
* `/api/rh/overview/route.ts`: Agregador analítico para dashboards corporativos.
* `/api/rh-pilot/route.ts`: Teste e validação de inferência do motor M2.7.

#### 2.3 Database & Armazenamento (`packages/database` & `supabase`)
* **Banco de Dados:** PostgreSQL com extensões `pgcrypto` e `vector`.
* **Armazenamento:** Supabase Storage (Bucket privado `voice-assessments`).
* **Tabelas Core Implementadas:**
  1. `tenants`: Isolamento multi-tenant (`id`, `name`, `slug`, `vertical`, `created_at`).
  2. `profiles`: Usuários do sistema (`id`, `tenant_id`, `role`, `full_name`, `email`).
  3. `employees`: Cadastro ocupacional (`id`, `tenant_id`, `external_id`, `full_name`, `department`, `business_unit`, `site_name`, `manager_id`, `shift_type`, `status`).
  4. `assessment_sessions`: Sessões de avaliação (`id`, `tenant_id`, `employee_id`, `protocol_version`, `vertical_pack`, `status`, `started_at`, `completed_at`).
  5. `assessment_answers`: Respostas item a item (`id`, `session_id`, `instrument_code`, `item_code`, `answer_numeric`, `answer_text`).
  6. `assessment_scores`: Scores finais consolidados (`id`, `session_id`, `composite_risk_score`, `risk_level`, `requires_human_review`, `confidence`, `reasons`).
  7. `ai_decisions`: Registro auditável de decisões da IA (`id`, `tenant_id`, `decision_type`, `status`, `control_description`, `automated_action_taken`, `memory_updates`).
  8. `ai_audit_logs`: Trilha de auditoria da IA (`id`, `decision_id`, `action`, `actor`, `old_memory`, `new_memory`, `scaffold_changes`).
  9. `manager_dashboard_aggregates`: Consolidação de métricas por período e unidade (`id`, `tenant_id`, `period_from`, `period_to`, `total_employees`, `assessed_count`, `compliance_score`).
  10. `risk_alerts`: Alertas operacionais de risco (`id`, `tenant_id`, `employee_id`, `session_id`, `alert_type`, `severity`, `remediation_plan`, `status`).
  11. `corrective_actions`: Ações preventivas e corretivas de SST (`id`, `tenant_id`, `assessment_score_id`, `title`, `description`, `status`, `priority`, `assigned_to`, `due_date`).
  12. `consent_logs` / `worker_consents`: Registro de termos e consentimentos explícitos (`id`, `employee_id`, `tenant_id`, `consent_type`, `is_granted`, `terms_version`, `ip_address`, `user_agent`).
  13. `care_referrals`: Encaminhamentos preventivos/clínicos (`id`, `tenant_id`, `employee_id`, `session_id`, `referral_type`, `urgency`, `status`, `sla_deadline`).
  14. `sos_sessions` & `sos_messages`: Sessões de triagem de crise e denúncias com SLA.
  15. `voice_sessions`: Metadados e índices de qualidade de áudio coletados.
  16. `audit_logs`: Trilha geral de auditoria de mutação de recursos.

#### 2.4 Domínio & Motores de Inteligência (`packages/domain` & `packages/ai-core`)
* **Instrumentos de Avaliação (`packages/domain/src/assessment/`):**
  * `COPSOQ_SHORT`: Copenhagen Psychosocial Questionnaire (versão resumida 10 itens em escala Likert 1-5).
  * `COPSOQ-II Completo`: Módulo estendido com percentis 40/60 (`copsoq-engine.ts`).
  * `GAD7`: Escala de Ansiedade Generalizada (7 itens).
  * `PHQ9`: Questionário de Saúde do Paciente (9 itens).
* **Motor de Composição de Risco (`score-composer.ts`):**
  * Normalização ponderada de múltiplos instrumentos e pesos configuráveis por vertical (`oil_and_gas`, `bpo_callcenter`, `healthcare`, `logistics`, `manufacturing`, `retail`, `finance`, `generic`).
* **Motor de Áudio / Biofonia Vocal (`voice/analyzer.ts`):**
  * Extração de métricas acústicas estruturadas (Taxa de fala WPM, densidade de pausas, variância de pitch, envelope de energia, jitter, shimmer) gerando índice técnico complementar com disclaimer legal.
* **Motor de Triagem SOS / Denúncia (`voice/risk-engine.ts`):**
  * Classificação de intenção (`normal`, `distress`, `crisis`, `whistleblower`) com fallback determinístico por regex.
* **Governança de IA e Supervisão Humana (`ai/human-in-the-loop.ts` & `packages/ai-core/src/guardrails.ts`):**
  * Fluxo de aprovação/rejeição humana de decisões algorítmicas, gravação em trilha de auditoria e filtros que impedem declaração de termos diagnósticos.

---

### 3. Matriz de Auditoria de Funcionalidades

| Componente / Funcionalidade | Status Atual | Localização no Código | Observações Técnicas |
| :--- | :--- | :--- | :--- |
| **Multi-Tenancy** | ✅ Implementado | `tenants`, `profiles`, `current_tenant_id()` | Isolamento via UUID e RLS |
| **Coleta de Questionários (COPSOQ/GAD/PHQ)** | ✅ Implementado | `WorkerWizard.tsx`, `assessment-service.ts` | Suporta token individual ou modo demo |
| **Análise Biovocal Complementar** | ✅ Implementado | `VoiceSessionUI.tsx`, `voice/analyzer.ts` | Processa áudio sem emitir emoções subjetivas |
| **Composição Ponderada de Risco** | ✅ Implementado | `score-composer.ts` | Ponderação por verticais de negócio |
| **Plano de Ações Corretivas (SST)** | 🟡 Parcial | `corrective_actions`, `ActionQueueTable.tsx` | Falta ciclo completo de evidência e reavaliação |
| **Trilha de Auditoria Geral & IA** | ✅ Implementado | `ai_audit_logs`, `audit_logs`, `human-in-the-loop.ts` | Rastreabilidade detalhada com ator e timestamp |
| **Gestão de Consentimento (RGPD)** | ✅ Implementado | `consent_logs`, `rgpd-consent-manager.ts` | Registra tipo, versão, IP e user-agent |
| **Canal de Denúncias (Lei 93/2021)** | ✅ Implementado | `sos/page.tsx`, `sos/actions.ts` | Triagem automática com SLA de 15 min |
| **Direito à Desconexão (Lei 83/2021)** | 🟡 Parcial | `AegisRiskAuditPDF.ts`, `act-report-generator.ts` | Menções e regras simuladas; falta indicador dedicado |
| **Relatórios Legais Portugal (Lei 102/ACT/Anexo D)** | ✅ Implementado | `ACTReportPDF.tsx`, `AnexoDReportPDF.tsx` | Geração em PDF de relatórios de SST |
| **Perfil Jurisdicional Configurável (PT / BR)** | 🔴 Ausente | — | Sistema atualmente assume Portugal/ACT como fixo |
| **Mapeamento NR-1 / GRO / PGR (Brasil)** | 🔴 Ausente | — | Falta Inventário de Riscos e terminologia brasileira |
| **Worker Voice Agregado (Brasil)** | 🔴 Ausente | — | Falta módulo focado estritamente na organização do trabalho |
| **Governança LGPD Específica (Brasil)** | 🟡 Parcial | `consent_logs` | Estrutura RGPD atende base, mas faltam termos LGPD |

---

### 4. Análise de Riscos Técnicos e Regulatórios

#### 4.1 Riscos Técnicos
1. **Tipagem TypeScript em `copsoq.ts`:** Algumas propriedades (`isPositive`) foram definidas sem valor padrão em instâncias do dicionário, causando falha no `tsc --noEmit`.
2. **Dependência Circular ou Tipagem em `@mindops/domain` vs `@mindops/database`:** `human-in-the-loop.ts` importava `@mindops/database` criando dependência cruzada entre pacotes.
3. **Hardcoding de Legislação Portuguesa:** Componentes de UI e templates de PDF possuem textos literais vinculados a Portugal (NIF, CAE, ACT, Lei 102/2009) sem suporte nativo a chave de internacionalização/jurisdição.

#### 4.2 Riscos Regulatórios e Comerciais (Claims Clínicos)
1. **Uso Indevido de Termos Clínicos:** Presença residual de termos como `"diagnóstico de aptidão"`, `"Centro de Diagnóstico"`, `"Detecção de Depressão"`, `"Indícios Sub-Clínicos"` em alguns pontos de UI (`EmployeeManagement.tsx`, `clinical/page.tsx`, `FichaAptidaoPDF.tsx`, `(marketing)/page.tsx`).
2. **Claims Absolutistas:** Embora a maior parte do código use salvaguardas (guardrails), slogans como `"Auditar Meu Risco de Multa Agora"` na landing page geram atrito de conformidade comercial.
3. **Posicionamento Corporativo vs. Diagnóstico Médico:** É imperativo que a plataforma se apresente consistentemente como **Inteligência de Riscos Psicossociais Ocupacionais (AI-Powered Decision Support)** e **Instrumento de Gestão de SST**, nunca como ferramenta de diagnóstico médico ou substituta de profissionais de saúde/SST.

---

### 5. Proposta de Arquitetura de Adaptação PT / BR (Multi-Jurisdição)

Para suportar simultaneamente **Portugal** (Lei 102/2009, Lei 93/2021, Lei 83/2021, RGPD) e **Brasil** (NR-1, GRO, PGR, Inventário de Riscos, Plano de Ação, LGPD) **SEM duplicar o core, banco ou aplicações**:

```
                                  ┌────────────────────────┐
                                  │   Organization Tenant  │
                                  │  (country_code: PT|BR) │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                             ┌──────────────────────────────────┐
                             │    Country / Jurisdiction Engine │
                             │      (@mindops/domain/jurisdiction)
                             └────────────────┬─────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
        ┌─────────────────────────┐                       ┌─────────────────────────┐
        │  Portugal Profile (PT)  │                       │   Brazil Profile (BR)   │
        ├─────────────────────────┤                       ├─────────────────────────┤
        │ • Marco: Lei 102/2009   │                       │ • Marco: NR-1 (GRO/PGR) │
        │ • Lei 93/2021 (Denúncia)│                       │ • Worker Voice Ocupac.  │
        │ • Lei 83/2021 (Descon.) │                       │ • Inventário de Riscos  │
        │ • Relatório ACT/Anexo D │                       │ • Plano de Ação PGR     │
        │ • Terminologia PT-PT    │                       │ • Terminologia PT-BR    │
        │ • Privacidade: RGPD     │                       │ • Privacidade: LGPD     │
        └─────────────────────────┘                       └─────────────────────────┘
                     │                                                 │
                     └────────────────────────┬────────────────────────┘
                                              │
                                              ▼
                             ┌──────────────────────────────────┐
                             │     Unified Psychosocial Core    │
                             │ • Assess (Instrument Engine)     │
                             │ • Identify & Analyze (AI/Scoring)│
                             │ • Intervene (Corrective Actions) │
                             │ • Evidence & Reassessment Loop   │
                             │ • Audit Trail & Human Oversight  │
                             └──────────────────────────────────┘
```

---

### 6. Estrutura do Ciclo de Risco Unificado (Core SST)

O ciclo contínuo de gestão de riscos será expandido sobre as tabelas existentes (`assessment_scores`, `risk_alerts`, `corrective_actions`):

$$\text{ASSESS} \longrightarrow \text{IDENTIFY} \longrightarrow \text{ANALYZE} \longrightarrow \text{INTERVENE} \longrightarrow \text{MONITOR} \longrightarrow \text{REASSESS} \longrightarrow \text{EVIDENCE}$$

* **Extensão de `corrective_actions`:** Adição de campos para rastrear `evidence_url`, `effectiveness_score`, `reassessment_due_date`, `responsible_name`, `hazard_factor` e `nr1_process_activity`.
* **Sem duplicações:** Mesma tabela e APIs servirão para medidas de prevenção em Portugal (Art. 15º Lei 102/2009) e Plano de Ação do PGR no Brasil (NR-1.5.5.2).

---
*Relatório de Auditoria concluído com sucesso e pronto para subsidiar o plano de execução incremental.*
