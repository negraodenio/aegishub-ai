# NEXT PHASE DISCOVERY: P4 — POLISH, PSYCHOSOCIAL RISK TERMINOLOGY UNIFICATION & PT/BR CONSISTENCY

**Documento:** `NEXT_PHASE_DISCOVERY.md`  
**Data:** 16 de Agosto de 2026  
**Auditor / Arquiteto:** Principal Software & SST Systems Architect  
**Status:** DISCOVERY CONCLUÍDO — READY FOR IMPLEMENTATION

---

## 1. OFFICIAL ROADMAP PHASE
### **FASE P4 — POLISH & UNIFIED OCCUPATIONAL CONSISTENCY**
*(Conforme definido em `11_AEGISHUB_IMPLEMENTATION_ROADMAP.md`, Seção 2, Item P4-01 e detalhado em `09_AEGISHUB_PT_BR_AUDIT.md` e `10_AEGISHUB_DASHBOARD_V2_SPEC.md`).*

- **Código da Fase:** `P4`
- **Prioridade:** Medium-High / Polish & Consistency
- **Posição no Roadmap:** Imediatamente após P3 (Multi-Tenant Workspace & Organization Switcher) e antes do encerramento final do roadmap.

---

## 2. BUSINESS OBJECTIVE
Garantir **consistência terminológica, proteção rigorosa de privacidade e alinhamento regulatório total entre Portugal (ACT / Lei 102/2009) e Brasil (NR-1 / GRO / PGR)** em todas as superfícies do produto (RH, Gestão de Linha, Admin de Compliance e Equipe), eliminando qualquer resquício de termos clínicos estigmatizantes em telas não médicas, removendo mock data residual em páginas secundárias e padronizando os empty states.

---

## 3. FUNCTIONAL SCOPE
1. **Unificação da Terminologia de Risco Ocupacional:**
   - Eliminar termos clínicos diagnósticos (ex: `burnout_risk`, `depressao_grave`) em visualizações de RH, Gestão e Executivos.
   - Adotar estritamente termos corporativos e ergonômicos padronizados: *"Sobrecarga Psicossocial"*, *"Exaustão Ocupacional"*, *"Fatores de Risco no Trabalho"*, *"Exigências Emocionais"*.
   - Segregar diagnósticos clínicos e scores individuais estritamente para o médico do trabalho no módulo `/clinical`.
2. **Saneamento de Mocks em Telas Secundárias:**
   - Conectar `/admin/compliance` (`OrganizationalHeatmap`) e `/admin/team` (`EmployeeManagement`) aos dados reais do tenant ativo via `resolveTenantContext()` e agregações do banco.
   - Atualizar a rota `/manager` para usar dinamicamente `CountryProfile` (RGPD vs LGPD) e remover branding estático obsoleto (*"Proteção Ativa M2.7"*).
3. **Consistência PT/BR Total:**
   - Garantir que NIF/CNPJ, CAE/CNAE, ACT/MTE, Lei 102/2009/NR-1, EUR (€)/BRL (R$) e timezone sejam aplicados uniformemente em todas as rotas com base no `country_code` do tenant ativo.
4. **Padronização de Empty States:**
   - Exibir telas de acolhimento profissional orientando o início da primeira campanha em todas as rotas secundárias para tenants sem avaliações.

---

## 4. EXISTING ARCHITECTURE
- **Domínio:** `@mindops/domain` possui `COUNTRY_PROFILES` completo para `PT` e `BR` (`country-profile.ts`) com toda a taxonomia legal, fiscal e de autoridade.
- **Tenant Context:** `resolveTenantContext()` resolve de forma segura o `countryCode`, `tenantId`, `role` e `membership` via cookie de sessão e `auth.uid()`.
- **Database Repositories:** `packages/database/src/repositories/campaign.ts` e `compliance-report.ts` já fornecem métricas agregadas reais por departamento.

---

## 5. CURRENT GAPS
1. **Mock Data em `/admin/compliance`:** O componente `OrganizationalHeatmap.tsx` ainda possui array fixo (`Engenharia de Software (Lisboa)`, etc.) em vez de ler `getCampaignAggregates()` do tenant ativo.
2. **Falta de `resolveTenantContext()` em `/admin/compliance` e `/admin/team`:** Páginas administrativas ainda realizam consultas manuais a `profiles` em vez de usar o guardião padrão de segurança.
3. **Terminologia Residual em `/manager`:** O painel do gestor de linha exibe texto estático citando RGPD sem verificar se o tenant é brasileiro (`LGPD`) e exibe badge legado *"M2.7"*.

---

## 6. DATABASE IMPACT
- **Zero alterações de schema / DDL:** As tabelas `tenants`, `tenant_memberships`, `campaigns`, `assessment_scores`, `corrective_actions`, `compliance_reports` cobrem 100% dos dados necessários.
- **Nenhuma nova migration é necessária.**

---

## 7. BACKEND IMPACT
- **Refatoração de Services/Actions:**
  - Atualizar `apps/web/app/admin/compliance/page.tsx` para chamar `resolveTenantContext()` com `requiredRoles: ["admin", "dpo", "rh", "sst_professional"]`.
  - Atualizar `apps/web/app/admin/team/page.tsx` para passar o `tenantId` seguro do contexto para `EmployeeManagement`.
  - Atualizar `apps/web/app/(dashboard)/manager/page.tsx` para usar `CountryProfile` resolvido dinamicamente.

---

## 8. FRONTEND IMPACT
- **`OrganizationalHeatmap.tsx`:** Conectar às métricas reais de departamentos de `campaign.ts`, respeitando o mascaramento de anonimato ($N < 5$).
- **`EmployeeManagement.tsx`:** Conectar à listagem real de participantes/membros do tenant ativo.
- **Formatadores de Moeda e Data:** Usar `Intl.NumberFormat` e `Intl.DateTimeFormat` configurados com a localidade do tenant (`pt-PT` / `pt-BR`).

---

## 9. SECURITY ANALYSIS
- **Autenticação:** Todas as páginas administrativas exigem sessão ativa (`auth.uid()`).
- **Anti-IDOR:** Nenhuma rota administrativa aceitará `tenantId` de query string sem checagem de membership server-side.
- **RBAC:** Acesso a compliance e equipe restrito a administradores, DPO, RH e profissionais de SST.

---

## 10. MULTI-TENANT ANALYSIS
- **Isolamento de Queries:** Todas as consultas em rotas administrativas filtrarão estritamente por `tenant_id = targetTenantId`.
- **Zero Cross-Tenant Leakage:** A alternância de organização no `WorkspaceHeader` refletirá imediatamente em `/admin/compliance` e `/manager`.

---

## 11. PRIVACY ANALYSIS
- **Proteção $N < 5$:** Células departamentais com menos de 5 respondentes são ocultadas com `"DADOS INSUFICIENTES (N < 5)"`.
- **Zero PHI em RH e Gestão:** Nenhum nome de colaborador ou diagnóstico clínico individual exposto fora do prontuário médico (`/clinical`).

---

## 12. PT/BR JURISDICTION IMPACT
- **🇵🇹 Portugal:**
  - Moeda: Euro (€)
  - Identificador: NIF / NIPC
  - Legislação: Lei n.º 102/2009
  - Autoridade: ACT
  - Privacidade: RGPD (Regulamento UE 2016/679)
- **🇧🇷 Brasil:**
  - Moeda: Real (R$)
  - Identificador: CNPJ
  - Legislação: Portaria MTP 4219/2022 (NR-1 / GRO / PGR)
  - Autoridade: MTE
  - Privacidade: LGPD (Lei nº 13.709/2018)

---

## 13. REQUIRED MIGRATIONS
- **Nenhuma migration necessária.**

---

## 14. REQUIRED APIS
- Utilização das Server Actions e Repositories existentes (`resolveTenantContext`, `getCampaignAggregates`, `getUserMemberships`, `getComplianceReportsByTenant`).

---

## 15. REQUIRED UI
- Refinamento de `OrganizationalHeatmap.tsx` com dados reais e empty states.
- Refinamento de `manager/page.tsx` com badges dinâmicos de jurisdição.
- Refinamento de formatadores monetários e datas nos cards do dashboard.

---

## 16. REQUIRED TESTS (MÍNIMO 15 A 20 NOVOS TESTES)
- Teste de segregação terminológica (ausência de termos diagnósticos clínicos no payload de RH/Gestor).
- Teste de adaptação dinâmica PT/BR no painel do Gestor de Linha.
- Teste de resolução segura de tenant em `/admin/compliance` e `/admin/team`.
- Teste de empty states profissionais em tenants recém-criados.
- Teste de anonimização $N < 5$ no heatmap organizacional.
- Testes de formatação monetária (EUR vs BRL) e timezone.
- **Preservação dos 114 testes anteriores (Total acumulado: 134 testes).**

---

## 17. RISKS
| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| **Quebra de páginas secundárias** | Médio | Validação estrita via TypeScript e testes automatizados. |
| **Exposição acidental de PHI** | Crítico | Auditoria automatizada de payload em testes de integração. |

---

## 18. OUT OF SCOPE (NÃO TOCAR)
- 🚫 **TDAH / Suporte Cognitivo / Neurodiversidade** (permanecem adiados para o fechamento do roadmap).
- 🚫 **Assistente Clínico Conversacional**.
- 🚫 **Novos Agentes Autônomos de IA**.
- 🚫 **Preservação de P0, P1, P2.1, P2.2, P2.3 e P3 intactos.**

---

## 19. IMPLEMENTATION SEQUENCE
1. **Passo 1:** Refatorar rotas administrativas (`/admin/compliance`, `/admin/team`, `/manager`) com `resolveTenantContext()`.
2. **Passo 2:** Conectar `OrganizationalHeatmap.tsx` às métricas reais com anonimização $N < 5$.
3. **Passo 3:** Unificar terminologia ocupacional em todas as views não clínicas.
4. **Passo 4:** Criar suíte de testes automatizados P4 (20 testes).
5. **Passo 5:** Executar validação de tipo (`turbo typecheck`), testes (`vitest`) e build de produção (`turbo build`).
6. **Passo 6:** Gerar `P4_IMPLEMENTATION_REPORT.md` e sincronizar no GitHub.

---

## 20. DEFINITION OF DONE
- Zero mock data em todas as rotas `/admin` e `/manager`.
- Zero termos clínicos em telas de RH/Gestor.
- 100% de consistência PT/BR baseada no tenant ativo.
- 134/134 testes automatizados PASS.
- Typecheck limpo e build de produção concluído.

---

## 21. RECOMENDAÇÃO OBJETIVA

```
============================================================
RECOMENDAÇÃO ARQUITETURAL:
READY FOR IMPLEMENTATION
============================================================
O escopo da Fase P4 é claro, não requer migrations de banco de
dados, aproveita as estruturas existentes e consolida a
consistência de todo o produto antes do fechamento do roadmap.
============================================================
```
