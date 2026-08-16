# P2.2 — EVIDENCE & INTERVENTION ENGINE DISCOVERY
**Documento:** `P2_2_EVIDENCE_INTERVENTION_DISCOVERY.md`  
**Data:** 16 de Agosto de 2026  
**Auditor / Arquiteto:** Principal Software & SST Systems Architect  
**Fase:** FASE 1 — Discovery & Gap Analysis (Prévia à Implementação P2.2)

---

## 1. ARQUITETURA ATUAL DE INTERVENÇÕES & AÇÕES

A auditoria inspecionou todo o pipeline de riscos e ações existente no monorepo:
1. `public.corrective_actions` — Tabela principal de medidas preventivas.
2. `public.risk_alerts` — Alertas de risco (inclui vínculos individuais de trabalhadores).
3. `public.campaigns` & `public.assessment_sessions` — Estrutura de campanhas corporativas (implementada na P1).
4. `packages/database/src/repositories/rh.ts` — Função `getActionQueue()`.
5. `apps/web/features/rh-dashboard/components/OrganizationalActionTable.tsx` — Componente de visualização de ações no dashboard RH V2.
6. `packages/database/src/repositories/report-service.ts` — Geradores de PDF/CSV para ACT (Portugal) e PGR (Brasil).

---

## 2. AUDITORIA DE TABELAS & ESTRUTURAS EXISTENTES

| Tabela | Colunas Atuais | Suporte a Tenant | Gaps Identificados para P2.2 |
| :--- | :--- | :---: | :--- |
| **`public.corrective_actions`** | `id`, `tenant_id`, `assessment_score_id`, `title`, `description`, `status`, `priority`, `assigned_to`, `due_date`, `responsible_name`, `hazard_factor`, `process_activity`, `evidence_url`, `evidence_notes`, `effectiveness_score`, `reassessment_date`, `reassessment_status` | ✅ RLS Ativo | Falta vínculo direto com `campaign_id`, máquina de estados estrita (`identified`, `planned`, `in_progress`, `evidence_pending`, `reassessment_pending`, `effective`, `ineffective`, `closed`), avaliador de eficácia e justificativa técnica. |
| **`public.action_evidence`** | *(Inexistente como tabela separada de multi-evidências)* | ❌ Inexistente | Apenas campos singulares `evidence_url` e `evidence_notes` na tabela pai. Falta suporte a múltiplas evidências estruturadas por ação (documento, foto, ata de reunião, política, treinamento) com hash de integridade e autor do upload. |
| **`public.action_audit_logs`** | *(Inexistente para ações organizacionais)* | ❌ Inexistente | Não há registro imutável de transições de status, adições de evidência ou registros de reavaliação de eficácia. |
| **`public.risk_alerts`** | `id`, `tenant_id`, `employee_id`, `alert_type`, `severity`, `status` | ✅ RLS Ativo | Misturava dados nominais de trabalhadores na fila do RH (`rh.ts:L88`). Deve ser mantido estritamente segregado no módulo clínico/SST. |

---

## 3. COMPONENTES EXISTENTES & PONTOS DE VULNERABILIDADE

1. **Vazamento de Identidade Individual no RH (`rh.ts`):**
   - `getActionQueue` realizava JOIN com `employees(full_name)` e expunha nomes de funcionários diretamente na fila operacional.
   - **Remediação P2.2:** O Action Center Organizacional do RH/SST deve exibir exclusivamente fatores organizacionais de risco, setor, prazo, responsável e status de evidência (**ZERO nomes de colaboradores**).
2. **Ciclo de Reavaliação e Eficácia Incompleto:**
   - A interface apenas listava ações, sem permitir registrar reavaliações, comparar deltas de risco baseline vs. pós-intervenção ou classificar a intervenção como `effective`, `partially_effective` ou `ineffective`.
   - **Remediação P2.2:** Implementar motor de cálculo de eficácia baseado em reavaliações reais ou indicar *"Dados insuficientes para cálculo de eficácia"*.

---

## 4. MIGRATIONS NECESSÁRIAS (NÃO-DESTRUTIVAS)

Criar a migração `supabase/migrations/20260816_evidence_and_intervention_engine_p2_2.sql`:
1. **Extensão de `public.corrective_actions`:**
   - Adicionar `campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL`.
   - Adicionar `reassessment_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL`.
   - Adicionar `effectiveness_rating TEXT CHECK (effectiveness_rating IN ('effective', 'partially_effective', 'ineffective', 'not_assessed'))`.
   - Adicionar `effectiveness_rationale TEXT`.
   - Adicionar `effectiveness_evaluated_by UUID REFERENCES auth.users(id)`.
   - Adicionar `effectiveness_evaluated_at TIMESTAMPTZ`.
2. **Nova Tabela `public.action_evidence`:**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
   - `tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE`.
   - `action_id UUID NOT NULL REFERENCES public.corrective_actions(id) ON DELETE CASCADE`.
   - `campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL`.
   - `evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'policy', 'procedure', 'training_record', 'meeting_minutes', 'work_schedule', 'ergonomic_assessment', 'photo', 'other'))`.
   - `title TEXT NOT NULL`.
   - `description TEXT`.
   - `file_url TEXT`.
   - `file_hash TEXT`.
   - `uploaded_by UUID REFERENCES auth.users(id)`.
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
   - RLS com isolamento estrito por `tenant_id = current_tenant_id()`.
3. **Nova Tabela `public.action_audit_logs`:**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
   - `tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE`.
   - `action_id UUID NOT NULL REFERENCES public.corrective_actions(id) ON DELETE CASCADE`.
   - `actor_id UUID REFERENCES auth.users(id)`.
   - `event_type TEXT NOT NULL CHECK (event_type IN ('created', 'status_changed', 'assigned', 'evidence_added', 'reassessment_recorded', 'effectiveness_evaluated', 'closed', 'reopened'))`.
   - `previous_state JSONB`.
   - `new_state JSONB`.
   - `notes TEXT`.
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
   - RLS habilitado.

---

## 5. MÁQUINA DE ESTADOS DA INTERVENÇÃO

```
[identified] ──(planejar)──> [planned] ──(iniciar)──> [in_progress]
                                                            │
                                                     (anexar evidência)
                                                            ▼
                                                 [evidence_pending]
                                                            │
                                                   (solicitar reavaliação)
                                                            ▼
                                               [reassessment_pending]
                                                            │
                                                     (avaliar eficácia)
                                                            ├──────────────┐
                                                            ▼              ▼
                                                       [effective]   [ineffective]
                                                            │              │
                                                       (concluir)     (replanejar)
                                                            ▼              ▼
                                                         [closed]      [planned]
```

---

## 6. PLANO DE IMPLEMENTAÇÃO P2.2

1. **Step 1 — Migração SQL (`20260816_evidence_and_intervention_engine_p2_2.sql`):** Tabelas `action_evidence`, `action_audit_logs` e extensão de `corrective_actions` com RLS.
2. **Step 2 — Repositório de Intervenções (`packages/database/src/repositories/intervention.ts`):**
   - Criação de intervenções vinculadas à campanha e fator de risco.
   - Máquina de estados com validação server-side.
   - Adição e listagem de evidências estruturadas.
   - Registro de reavaliação e cálculo de eficácia delta.
   - Log imutável de auditoria em `action_audit_logs`.
3. **Step 3 — Server Actions & Rotas de API Seguras:**
   - `apps/web/app/admin/actions/interventions.ts`
   - `apps/web/app/api/interventions/route.ts`
   - `apps/web/app/api/interventions/[id]/evidence/route.ts`
   - `apps/web/app/api/interventions/[id]/reassess/route.ts`
4. **Step 4 — Componentes do Action Center V2:**
   - `ActionCenterV2.tsx` com filtro por status, prazo, prioridade e campanha.
   - `CreateInterventionModal.tsx` com seleção de fatores organizacionais de risco e prazos.
   - `EvidenceManagerModal.tsx` para anexar e visualizar evidências com hash de integridade.
   - `ReassessmentModal.tsx` para registro de eficácia e parecer técnico.
   - `InterventionKPIGrid.tsx` com 7 métricas reais (Abertas, Em Atraso, Em Progresso, Aguardando Evidência, Aguardando Reavaliação, Eficazes, Taxa de Conclusão).
5. **Step 5 — Atualização do Dashboard RH V2 e Relatórios Regulatórios:**
   - Atualizar `apps/web/features/rh-dashboard/components/OrganizationalActionTable.tsx`.
   - Atualizar geradores de relatórios ACT / PGR para extrair evidências auditadas.
6. **Step 6 — Suíte de Testes Automatizados (20 novos testes P2.2):**
   - `packages/database/src/__tests__/intervention-p2.test.ts` cobrindo todos os 20 requisitos obrigatórios.
7. **Step 7 — Build, Typecheck e Relatório P2.2:**
   - `npx vitest run` (74/74 PASS).
   - `turbo typecheck` & `turbo build`.
   - `P2_2_IMPLEMENTATION_REPORT.md` e commit Git.
