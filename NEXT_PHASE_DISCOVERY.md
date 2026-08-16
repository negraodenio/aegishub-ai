# NEXT PHASE DISCOVERY: P3 — MULTI-TENANT WORKSPACE & ORGANIZATION SWITCHER
**Documento:** `NEXT_PHASE_DISCOVERY.md`  
**Data:** 16 de Agosto de 2026  
**Auditor / Arquiteto:** Principal Software & SST Systems Architect  
**Status:** FASE A — DISCOVERY CONCLUÍDO / READY FOR IMPLEMENTATION

---

## 1. NOME OFICIAL DA PRÓXIMA FASE

### **FASE P3 — MULTI-TENANT WORKSPACE & ORGANIZATION SWITCHER**
Conforme estabelecido em `11_AEGISHUB_IMPLEMENTATION_ROADMAP.md` (Seção 2, Item P3-01) e detalhado em `10_AEGISHUB_DASHBOARD_V2_SPEC.md` (Seção 3).

---

## 2. OBJETIVO DA FASE P3

Permitir que utilizadores corporativos, consultores de SST, médicos do trabalho, auditores e gestores com acesso a múltiplas empresas/unidades (**Multi-Membership**) possam **selecionar, alternar e navegar de forma fluida e segura entre organizações**, com:

1. Validação estrita de autorização no servidor (o utilizador só pode alternar para tenants onde possua `tenant_memberships` ativo);
2. Persistência de contexto de sessão em cookie seguro HTTP-only (`current_tenant_id`);
3. Adaptação instantânea de todo o dashboard à jurisdição da empresa selecionada (🇵🇹 Portugal: Lei 102/2009 / ACT / EUR vs 🇧🇷 Brasil: NR-1 / GRO / PGR / BRL);
4. Isolamento absoluto de dados entre tenants durante e após a troca;
5. **Zero exposição de dados clínicos individuais (PHI) e preservação total das fases P0, P1, P2.1, P2.2 e P2.3.**

---

## 3. REQUISITOS OBRIGATÓRIOS

1. **Validação Server-Side Anti-Spoofing:** A troca de tenant nunca aceita um `tenantId` arbitrário enviado pelo cliente sem checar se `auth.uid()` possui associação válida e ativa em `public.tenant_memberships`.
2. **Atualização Segura de Sessão:** A alternância deve gravar o cookie de contexto `current_tenant_id` e revalidar o cache de rotas (`/rh`, `/clinical`, `/manager`, `/admin`).
3. **Interface Visual no WorkspaceHeader:** O cabeçalho deve exibir o seletor interativo `[🏢 Nome da Empresa ▾]` com lista de organizações autorizadas, bandeira do país (🇵🇹/🇧🇷), papel do utilizador no tenant (Admin, RH, SST, etc.) e status da organização.
4. **Navegação com Preservação de Estado:** Ao trocar de tenant, o sistema deve resetar campanhas selecionadas de tenants anteriores para evitar estados inconsistentes na URL.
5. **Empty State para Membro sem Organização:** Caso um utilizador não possua nenhuma organização ativa, exibir tela de acolhimento e instrução de onboarding.

---

## 4. DEPENDÊNCIAS & REQUISITOS ANTERIORES

- ✅ **P0 (Security & Multi-Tenant):** Tabela `tenant_memberships`, função `resolveTenantContext()`, políticas RLS.
- ✅ **P1 (Campaign Management Engine):** Agregações de campanha por tenant.
- ✅ **P2.1 (AI Governance & Real Data):** Logs e governança isolados por tenant.
- ✅ **P2.2 (Evidence & Intervention Engine):** Plano de ação SST/PGR isolado por tenant.
- ✅ **P2.3 (Regulatory Compliance Engine):** Dossiês estatutários versionados por tenant.

---

## 5. ARTEFATOS E ESTRUTURAS ENVOLVIDOS

### 5.1 Tabelas do Banco de Dados
- `public.tenants` (Leitura de metadados: `name`, `slug`, `country_code`, `tax_id`, `economic_activity_code`)
- `public.tenant_memberships` (Verificação de pertencimento: `user_id`, `tenant_id`, `role`, `status = 'active'`)
- `public.profiles` (Perfil e vínculo padrão de fallback)

### 5.2 Arquivos Existentes a Integrar / Refinar
- `apps/web/lib/tenant-context.ts` (Resolução de contexto e leitura do cookie `current_tenant_id`)
- `apps/web/features/rh-dashboard/components/WorkspaceHeader.tsx` (Adição do seletor interativo de tenant)
- `packages/database/src/repositories/membership.ts` (Funções de consulta de memberships)

### 5.3 Novos Arquivos a Criar
- `apps/web/app/admin/actions/workspace.ts` (Server Action `switchOrganizationAction(targetTenantId)`)
- `apps/web/features/rh-dashboard/components/OrganizationSwitcherModal.tsx` (Modal/Dropdown interativo de seleção de organização)
- `packages/database/src/__tests__/workspace-switcher-p3.test.ts` (Suíte de 15 a 20 testes de segurança e alternância)

---

## 6. ANÁLISE DE RISCOS

| Categoria | Risco Identificado | Mitigação Arquitetural |
| :--- | :--- | :--- |
| **Segurança Multi-Tenant** | Tentativa de alternar para `tenantId` onde o utilizador não é membro (IDOR). | `switchOrganizationAction` consulta `tenant_memberships` do usuário logado via `auth.uid()`. Se não existir registro ativo, a operação é rejeitada com erro 403. |
| **Vazamento de Sessão** | Troca de tenant manter em cache dados da campanha do tenant anterior. | Ao alternar tenant, a action limpa o cookie/parâmetro `campaignId` da URL e executa `revalidatePath()`. |
| **RBAC** | Utilizador com papel "Admin" na Empresa A assumir "Admin" indevidamente na Empresa B (onde é apenas "Employee"). | O papel RBAC é resolvido dinamicamente por tenant a partir de `tenant_memberships.role` da organização ativa. |
| **Privacidade (PHI)** | Exposição de dados de saúde entre empresas do mesmo grupo. | RLS ativo em todas as tabelas clínicas e organizacionais com `tenant_id = public.current_tenant_id()`. |
| **Regulatório (PT/BR)** | Empresa brasileira carregar terminologia portuguesa (ACT) ou vice-versa. | O perfil de país (`country_code`) é carregado imediatamente a partir de `CountryProfile` do novo tenant. |

---

## 7. NECESSIDADE DE MIGRATIONS

- **Nenhuma migration nova é estritamente necessária no banco de dados**, pois as tabelas `public.tenants`, `public.tenant_memberships` e as funções RLS já foram completamente criadas e migradas na Fase P0.

---

## 8. PLANO DE TESTES AUTOMATIZADOS (MÍNIMO 15 TESTES P3)

1. `List user memberships`: Retorna todas as organizações onde o usuário é membro ativo.
2. `Switch organization allowed`: Usuário membro da Empresa A e B alterna com sucesso para B.
3. `Switch organization forbidden`: Tentativa de alternar para Empresa C (onde não é membro) é rejeitada com 403.
4. `Inactive membership blocked`: Usuário com status `suspended` ou `pending` não pode ativar a organização.
5. `RBAC role adaptation`: Usuário assume papel de "RH" na Empresa A e papel de "SST" na Empresa B.
6. `Jurisdiction adaptation`: Troca de PT para BR altera terminologia estatutária de ACT para NR-1/PGR.
7. `Tenant isolation on switch`: Queries subsequentes retornam exclusivamente dados do novo tenant ativo.
8. `Campaign query reset`: Alternância reseta parâmetros residuais de campanha pertencentes ao tenant anterior.
9. `Empty membership handling`: Usuário sem nenhuma organização recebe mensagem clara de onboarding.
10. `Anti-spoofing header`: Header não confia em dados passados pelo cliente sem checagem de membership.
11. `Audit log integrity`: Evento de troca de tenant é rastreável.
12. `No PHI cross-contamination`: Dados de colaboradores de A nunca aparecem no dashboard de B.
13. `Currency & timezone update`: EUR/Europe/Lisbon atualiza para BRL/America/Sao_Paulo.
14. `Single membership user`: Usuário com apenas 1 organização visualiza cabeçalho limpo sem dropdown desnecessário.
15. `No mock data`: Listagem de empresas provém 100% da tabela `tenants`.

---

## 9. FUNCIONALIDADES QUE NÃO DEVEM SER TOCADAS

Em cumprimento às regras estritas do projeto:
- 🚫 **NÃO tocar em TDAH / Cognitive Support / Neurodiversity** (permanecem adiados).
- 🚫 **NÃO implementar Assistente Clínico Conversacional**.
- 🚫 **NÃO alterar os 94 testes existentes de P0, P1, P2.1, P2.2 e P2.3** (devem continuar 100% PASS).
- 🚫 **NÃO refatorar visualmente dashboards ou inventar dados fictícios**.

---

## 10. RECOMENDAÇÃO OBJETIVA

```
============================================================
RECOMENDAÇÃO ARQUITETURAL:
READY FOR IMPLEMENTATION
============================================================
A fundação de banco de dados (P0/P1/P2) está 100% pronta, testada
e aplicada no Supabase. O discovery da Fase P3 está completo e
sem pendências ou bloqueios arquiteturais.
============================================================
```
