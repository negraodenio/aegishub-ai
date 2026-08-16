# P2.3 REGULATORY COMPLIANCE & REPORTING ENGINE — DISCOVERY REPORT
**Documento:** `P2_3_REGULATORY_REPORTING_DISCOVERY.md`  
**Data:** 16 de Agosto de 2026  
**Auditor / Arquiteto:** Principal Software & SST Systems Architect  
**Status:** FASE A — DISCOVERY COMPLETO & ARQUITETURA DEFINIDA

---

## 1. OBJETIVO DO MOTOR REGULATÓRIO P2.3

Transformar os dados reais existentes no AegisHub AI em **EVIDÊNCIA ORGANIZADA, AUDITÁVEL, VERSIONADA E EXPORTÁVEL** para Portugal (Lei 102/2009 / ACT) e Brasil (NR-1 / GRO / PGR):

$$\text{CAMPAIGN} \longrightarrow \text{RISK ASSESSMENT} \longrightarrow \text{RISK FACTORS} \longrightarrow \text{INTERVENTIONS} \longrightarrow \text{EVIDENCE} \longrightarrow \text{REASSESSMENT} \longrightarrow \text{EFFECTIVENESS} \longrightarrow \text{REGULATORY REPORT} \longrightarrow \text{AUDIT TRAIL}$$

---

## 2. AUDITORIA DOS COMPONENTES E ESTRUTURAS EXISTENTES

| Componente / Arquivo | Estado Atual | Gaps Identificados & O que Deve Ser Corrigido |
| :--- | :--- | :--- |
| **`ACTDownloadButton.tsx`** | Client component com `@react-pdf/renderer` | Usa fallback para `generateACTReportMockData(tenantName)`. Não recebe dados da campanha nem grava log de auditoria. |
| **`NR1DownloadButton.tsx`** | Client component com `@react-pdf/renderer` | Usa fallback para `generateNR1PGRMockData(tenantName)`. Não recebe dados reais do PGR nem persiste versão. |
| **`packages/database/src/services/report-service.ts`** | Serviço legado | Contém `// MOCK de distribuição para o POC operacional` com NIF, percentuais fixos e diagnósticos fictícios. **DEVE SER ELIMINADO/SUBSTITUÍDO POR DADOS REAIS**. |
| **`packages/database/src/repositories/report-service.ts`** | Repositório | `generateLegalACTReport` agrega apenas a nível de tenant global, sem vínculo à campanha, sem suporte a BR/PGR e sem versionamento. |
| **`ACTReportPDF.tsx`** | Template PDF | Estética básica, sem metadados de versionamento, sem hash SHA-256 e sem declaração explícita de limitação estatística ($N < 5$). |
| **`NR1PGRReportPDF.tsx`** | Template PDF | Template visualmente aceitável, mas sem vínculo a evidências reais anexadas na Fase P2.2 e sem hash de integridade. |
| **`ComplianceScoreCard.tsx`** | Card de métrica | Afirma "Compliance NR-1" com score estático ("Excelente"/"Crítico"), violando a regra contra claims automáticos de conformidade legal. |
| **`CountryProfile`** | Domain Model | Bem estruturado em `packages/domain/src/jurisdiction/country-profile.ts` (`PORTUGAL_PROFILE`, `BRAZIL_PROFILE`). |
| **`campaigns`** | DB Table (P1) | Estrutura real ativa com `id`, `tenant_id`, `name`, `code`, `start_date`, `end_date`, `min_anonymity_group_size`. |
| **`corrective_actions`** | DB Table (P2.2) | Possui `campaign_id`, `hazard_factor`, `process_activity`, `effectiveness_rating`, `effectiveness_rationale`. |
| **`action_evidence`** | DB Table (P2.2) | Possui `file_hash`, `evidence_type`, `title`, `description`, `uploaded_by`, RLS ativo. |
| **`action_audit_logs`** | DB Table (P2.2) | Rastro imutável de eventos da intervenção. |
| **`assessment_scores`** | DB Table (P0) | Scores reais agregados com mascaramento $N < 5$. |
| **Tabelas de Relatórios** | Inexistente | **Não existe tabela para persistir relatórios gerados, número de versão, hash SHA-256 e auditoria de downloads.** |

---

## 3. IDENTIFICAÇÃO DE MOCKS A ELIMINAR

1. **`generateACTReportMockData` (`act-report-generator.ts`):** Substituir por montagem estrita a partir de `getCampaignAggregates()` e `getInterventionsByTenant()`.
2. **`generateNR1PGRMockData` (`NR1PGRReportPDF.tsx`):** Substituir por gerador de dados reais de inventário de risco e plano de ação NR-1.
3. **`getAnexoDStats` (`services/report-service.ts`):** Eliminar todos os percentuais arbitrários (`Math.floor(total * 0.15)`).
4. **Falsos claims de conformidade:** Remover textos que declarem "Empresa está em conformidade 100%". O sistema deve certificar:  
   *"Evidências e indicadores disponíveis para suporte às atividades de conformidade regulatória."*

---

## 4. MODELO DE DADOS & SCHEMAS NECESSÁRIOS (P2.3)

Para atender aos requisitos de **Report Versioning**, **Content Hash** e **Audit Trail**, criaremos a migração `20260816_compliance_reports_p2_3.sql`:

```sql
-- 1. Tabela de Relatórios Regulatórios Gerados e Versionados
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'campaign_executive',
    'sst_action_plan',
    'act_evidence_pt',
    'nr1_pgr_evidence_br',
    'intervention_effectiveness',
    'ai_governance_audit'
  )),
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('PT', 'BR')),
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  content_hash TEXT NOT NULL,
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Auditoria de Relatórios
CREATE TABLE IF NOT EXISTS public.report_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.compliance_reports(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('REPORT_GENERATED', 'REPORT_DOWNLOADED', 'REPORT_REGENERATED', 'REPORT_VIEWED')),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. OS 6 TIPOS DE RELATÓRIO OFICIAIS

1. **`campaign_executive` (Relatório Executivo da Campanha):**
   - População-alvo, taxa de participação, distribuição de risco, heatmaps anonimizados ($N \ge 5$).
2. **`sst_action_plan` (Plano de Medidas de SST / PGR):**
   - Fatores de risco psicossocial identificados, setor/processo, medidas preventivas, responsáveis, prazos e status.
3. **`act_evidence_pt` (Dossiê de Evidências ACT / Lei 102/2009):**
   - Mapa de riscos psicossociais, participação de trabalhadores (Art. 18º), plano de prevenção (Art. 15º), evidências anexadas com SHA-256 e reavaliações periódicas.
4. **`nr1_pgr_evidence_br` (Inventário de Riscos & PGR NR-1):**
   - Inventário de perigos/fatores psicossociais, severidade vs probabilidade, plano de ação NR-1.5.5, evidências documentais e pareceres de eficácia.
5. **`intervention_effectiveness` (Relatório de Eficácia de Intervenções):**
   - Análise quantitativa e qualitativa antes vs depois de reavaliações, status de mitigação, eficácia comprovada vs ineficaz.
6. **`ai_governance_audit` (Dossiê de Governança de IA / EU AI Act):**
   - Rastreabilidade de decisões automatizadas, validações humanas (Human-in-the-loop), calibração de modelos e audit trail.

---

## 6. REGRAS DE PRIVACIDADE E HONESTIDADE ESTATÍSTICA

1. **Mascaramento por $N < 5$:** Qualquer departamento ou agrupamento com menos de 5 participantes é obrigatoriamente mascarado com `DADOS INSUFICIENTES PARA AGREGAÇÃO (N < 5)`.
2. **Zero PHI:** Nomes de colaboradores, CPFs, NIFs individuais e diagnósticos clínicos (ex: PHQ-9 individual) são expressamente proibidos em relatórios de RH/SST.
3. **Honestidade Estatística:** Campanhas sem reavaliações concluídas reportam `Efetividade: Não disponível — reavaliação pendente` e nunca "0% de eficácia" ou "100% conformidade".
4. **Resolução de Tenant Server-Side:** A geração de relatórios resolve o tenant exclusivamente via sessão autenticada (`resolveTenantContext()`). Parâmetros `?tenantId=` são descartados.

---

## 7. PLANO DE TESTES AUTOMATIZADOS (20 TESTES P2.3)

1. `Generate PT campaign report`: Gera dossiê Lei 102/2009 com terminologia e dados reais.
2. `Generate BR campaign report`: Gera dossiê NR-1 / PGR com inventário e plano de ação.
3. `Tenant isolation`: Tenant A não lista nem acede a relatórios do Tenant B.
4. `Cross-tenant report blocked`: Tentativa de download do relatório do Tenant B por Tenant A é rejeitada.
5. `Cross-tenant campaign blocked`: Tentativa de gerar relatório para campanha de outro tenant é bloqueada.
6. `RBAC authorization`: Admin/SST/RH/DPO podem gerar relatórios; Employee é rejeitado.
7. `Campaign scoping`: Relatório filtra estritamente avaliações e intervenções da campanha especificada.
8. `Period scoping`: Relatório respeita os limites de data da campanha.
9. `N < 5 privacy masking`: Setores com menos de 5 avaliações são mascarados.
10. `No PHI in RH report`: Relatório não contém nomes de funcionários ou diagnósticos médicos individuais.
11. `Evidence traceability`: Evidências documentais e hashes SHA-256 constam no relatório.
12. `Intervention traceability`: Medidas preventivas vinculadas a fatores de risco e responsáveis.
13. `Reassessment traceability`: Pareceres técnicos de eficácia e notas constam no relatório.
14. `Empty campaign report`: Campanha sem respostas gera relatório limpo com aviso de dados insuficientes.
15. `Missing data handling`: Ausência de intervenções ou evidências exibe "Nenhuma registada" sem lançar exceções.
16. `No fake 0% compliance`: Não calcula score de conformidade inexistente.
17. `Report versioning`: Regeneração de relatório incrementa versão sem sobrescrever registros antigos.
18. `Audit log`: Geração e download de relatórios inserem registros em `report_audit_logs`.
19. `Report integrity hash`: SHA-256 do relatório é calculado e validado para garantir não-repúdio.
20. `No mock data leakage`: Assegura que nenhum dado mock (NIF fixo, nomes fictícios) é injetado.
