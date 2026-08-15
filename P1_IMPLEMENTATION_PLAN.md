# P1 IMPLEMENTATION PLAN — CAMPAIGN ENGINE & ENTERPRISE DASHBOARD V2
**Documento:** `P1_IMPLEMENTATION_PLAN.md`  
**Data:** 16 de Agosto de 2026  
**Status:** PRONTO PARA EXECUÇÃO

---

## 1. OBJETIVO DO P1
Implementar a fundação Enterprise de **Campanhas de Avaliação Psicossocial (`public.campaigns`)**, vincular sessões de avaliação às campanhas, aplicar limiar de anonimato ($N \ge 5$) e construir o **Dashboard Enterprise V2** com segregação de jurisdição (PT Lei 102/2009 / BR NR-1), seletores de Tenant/Campanha e remoção definitiva de qualquer dado individual no painel de RH.

---

## 2. ETAPAS DE IMPLEMENTAÇÃO

### P1.1 — Schema & Database Migration
- **Arquivo:** `supabase/migrations/20260816_campaign_management_p1.sql`
- **Conteúdo:**
  1. `CREATE TABLE public.campaigns` com campos: `id`, `tenant_id`, `code`, `title`, `description`, `country_code`, `methodology`, `instruments`, `target_departments`, `target_business_units`, `min_anonymity_group_size`, `start_date`, `end_date`, `status`, `allow_voice_screening`, `created_by`, `created_at`, `updated_at`.
  2. Gerador sequencial de código de campanha único por tenant: `generate_campaign_code(tenant_id) -> "AEG-2026-000001"`.
  3. `CREATE TABLE public.campaign_participants` (`id`, `tenant_id`, `campaign_id`, `employee_id`, `status`, `invited_at`, `completed_at`).
  4. `ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;`
  5. RLS Policies para `campaigns` e `campaign_participants` com isolamento por `tenant_id = current_tenant_id()`.
  6. Índices de performance para busca por tenant, status e datas.

### P1.2 — Repositório de Campanhas & Tipagens
- **Arquivos:**
  - `packages/database/src/repositories/campaign.ts` (CRUD de campanhas, transições de status, geração de participantes, métricas de agregação por campanha com filtro de anonimato).
  - `packages/database/src/generated.types.ts` (Atualizar tipagem do Supabase para `campaigns` e `campaign_participants`).
  - `packages/database/src/index.ts` (Exportar repositório e serviços de campanha).

### P1.3 — Motor de Privacidade e Anonimato ($N \ge 5$)
- **Arquivo:** `packages/domain/src/privacy/anonymity-guard.ts` (ou integrado no repositório de agregação).
- **Regra:** Se o total de participantes respondentes em um departamento/unidade for menor que `min_anonymity_group_size` (default: 5):
  - Retornar `{ hasSufficientData: false, message: "Dados insuficientes para agregação (N < 5)" }`.
  - Ocultar médias, sub-scores e distribuições daquela célula específica.

### P1.4 — Server Actions & API Routes de Campanhas
- **Arquivos:**
  - `apps/web/app/admin/campaigns/actions.ts`: `createCampaignAction`, `updateCampaignStatusAction`, `getCampaignsAction`.
  - `apps/web/app/api/campaigns/route.ts`: Listagem e criação com validação de tenant context.
  - `apps/web/app/api/campaigns/[id]/aggregates/route.ts`: Agregações e métricas da campanha respeitando anonimato.

### P1.5 — Dashboard Enterprise V2
- **Arquivos:**
  - `apps/web/app/(dashboard)/rh/page.tsx`: Reestruturado com Workspace Header, Campaign Selector, Empty States profissionais, Cards de métricas reais (Taxa de Participação, Índice de Risco, Medidas Ativas, Cobertura de Evidências, Reavaliação), Heatmap com anonimato e Action Center organizacional (zero dados clínicos individuais).
  - `apps/web/features/rh-dashboard/components/WorkspaceHeader.tsx`: Tenant Selector + Jurisdição Badge (PT / BR).
  - `apps/web/features/rh-dashboard/components/CampaignSelector.tsx`: Dropdown de campanhas ativas/históricas com status badge.
  - `apps/web/features/rh-dashboard/components/EmptyCampaignState.tsx`: Estado profissional quando nenhuma campanha existe ou está aguardando respostas.
  - `apps/web/features/rh-dashboard/components/EnterpriseKPIGrid.tsx`: Grid de 5 indicadores fundamentais sem fallback para scores zerados artificiais.
  - `apps/web/features/rh-dashboard/components/AnonymizedHeatmap.tsx`: Mapa de calor por departamento com máscara automática para $N < 5$.
  - `apps/web/features/rh-dashboard/components/OrganizationalActionTable.tsx`: Tabela de ações preventivas corporativas sem nomes de colaboradores ou diagnósticos individuais.

### P1.6 — Suíte de Testes Automatizados P1
- **Arquivo:** `packages/database/src/__tests__/campaign-p1.test.ts`
- **15 Cenários Obrigatórios:**
  1. Criação de campanha com código sequencial no formato `AEG-2026-XXXXXX`.
  2. Isolamento de campanha cross-tenant (Tenant A não lista campanhas do Tenant B).
  3. Tentativa de associar participante de outro tenant rejeitada.
  4. Vinculação de `assessment_session` à campanha ativa.
  5. RBAC: RH pode criar e gerenciar campanhas; Employee não pode.
  6. Ciclo de vida da campanha (transições válidas e bloqueio de transições ilegais como `completed -> draft`).
  7. Acesso anônimo a campanhas bloqueado (401).
  8. IDOR em `/api/campaigns/[id]` bloqueado (403 para campanha de outro tenant).
  9. Limiar de anonimato $N \ge 5$: departamento com 3 respostas é mascarado.
  10. Limiar de anonimato $N \ge 5$: departamento com 6 respostas exibe score agregado normal.
  11. Segregação de RH: RH nunca recebe scores individuais de colaboradores.
  12. Segregação de Gestor: Manager só visualiza dados da sua própria unidade se $N \ge 5$.
  13. Troca de campanha via seletor com validação de tenant context.
  14. Adaptação de jurisdição PT (ACT, Lei 102/2009) e BR (PGR, NR-1).
  15. Empty State de campanha: ausência de dados tratada com badge neutro e CTA, sem erro 0% de compliance.

### P1.7 — Validação de Não-Regressão
- Executar `vitest` em todos os testes (P0 + P1 = 39+ testes).
- Executar `npm run typecheck` em todos os 8 pacotes.
- Executar `npm run build` para garantir build 100% limpo.
- Gerar `P1_IMPLEMENTATION_REPORT.md`.
