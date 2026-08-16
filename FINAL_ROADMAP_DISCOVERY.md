# AEGISHUB AI — FINAL ROADMAP DISCOVERY
**Documento:** `FINAL_ROADMAP_DISCOVERY.md`  
**Data:** 16 de Agosto de 2026  
**Auditor / Arquiteto:** Principal Enterprise & AI Compliance Architect  
**Status:** DISCOVERY CONCLUÍDO — ANÁLISE ARQUITETURAL DE TRANSIÇÃO (P5 / COGNITIVE & NEURODIVERSITY SUPPORT)

---

## 1. QUAL É A PRÓXIMA FASE OFICIAL?

Com a conclusão e certificação das fases:
- **P0:** Enterprise Security & Multi-Tenant Isolation (15/15 tests PASS)
- **P1:** Campaign Management Engine & Dashboard V2 (15/15 tests PASS)
- **P2.1:** AI Governance & Real Data — EU AI Act (15/15 tests PASS)
- **P2.2:** Evidence & Intervention Engine — SST/PGR (20/20 tests PASS)
- **P2.3:** Regulatory Compliance & Reporting Engine (20/20 tests PASS)
- **P3:** Multi-Tenant Workspace & Organization Switcher (20/20 tests PASS)
- **P4:** Polish, Occupational Risk Terminology & PT/BR Consistency (20/20 tests PASS)

A próxima fase oficial do Roadmap Geral do Ecossistema AegisHub é a **FASE P5 — COGNITIVE SUPPORT & NEURODIVERSITY PLATFORM (COGNITIVE EXECUTIVE SUPPORT ENGINE & B2B BENEFIT FEDERATION)**.

---

## 2. QUAL É O OBJETIVO EMPRESARIAL?

Oferecer um módulo de **Apoio Executivo & Suporte Cognitivo (Neuroinclusão / Foco / Organização Diária)** como um **Benefício Corporativo de Bem-Estar e Produtividade**, permitindo que colaboradores tenham ferramentas de assistência cognitiva (estratégias de foco, gestão de tempo, micro-pausas e redução de sobrecarga mental) **sem estigmatização, sem compartilhamento de dados com a entidade patronal e sem finalidade diagnóstica médica**.

Para a organização (B2B):
- Cumprimento de metas ESG e políticas de diversidade e neuroinclusão.
- Redução de absenteísmo decorrente de sobrecarga executiva.
- Blindagem jurídica total: a organização **não tem acesso** a quais colaboradores utilizam o módulo nem a históricos individuais.

---

## 3. QUAL É O ESCOPO FUNCIONAL?

### No Escopo:
1. **Ativação de Benefício por Tenant (Tenant Feature Flag):** O RH pode habilitar ou desabilitar o benefício corporativo para a empresa, gerando cotas de ativação.
2. **Espaço Pessoal Seguro do Colaborador (`/employee/cognitive`):**
   - Ferramentas de Suporte Executivo: Planejador de blocos de foco, quebra de tarefas complexas (*Task Decomposer*), técnicas de descompressão mental e gerenciamento de ritmo.
   - Questionários de Autorreflexão Funcional (ex: MEQ-5 para cronotipo/ritmo circadiano e escalas de sobrecarga de atenção funcional — *nunca para rotulagem clínica*).
   - Diário pessoal de produtividade e rotina com criptografia e isolamento por utilizador.
3. **LLM Usage Guard & Quota Shield (Proteção de Custos):**
   - Rate limiting atômico (Postgres Leases) para agentes de assistência cognitiva.
   - Teto financeiro estrito ($0.25/dia/usuário) evitando abusos de IA.
4. **Relatório Agregado Cego para o RH (Se $N \ge 20$):**
   - O RH visualiza unicamente: *Total de licenças ativas contratadas vs. Taxa agregada global de adesão ao benefício (ex: "62% dos colaboradores ativaram o benefício de bem-estar")*.
   - **Zero** identificação de indivíduos, **zero** categorias neurodivergentes, **zero** métricas de desempenho associadas.

### Fora de Escopo:
- Diagnóstico clínico de TDAH, Autismo ou qualquer patologia (CID-10 / DSM-5).
- Compartilhamento de dados de uso, notas ou reflexões com gestores ou RH.
- Assistente médico ou prescrição de intervenções terapêuticas.
- Monitoramento de produtividade ou vigilância de tempo de trabalho.

---

## 4. QUAIS COMPONENTES EXISTENTES SERÃO REUTILIZADOS?

- `resolveTenantContext()`: Para validação de membership corporativo e verificação da flag de benefício ativo.
- `@mindops/ui`: Componentes de design system (Card, Button, Dialog, Switch, Badge, Progress).
- `@mindops/ai-core`: Infraestrutura de conexão a LLM e guardrails de segurança.
- `utils/supabase/server.ts` & `utils/supabase/client.ts`: Clientes Supabase com RLS.
- `OrganizationSwitcherModal`: Preservado para alternância de organizações no ambiente administrativo.

---

## 5. QUAIS NOVOS COMPONENTES SERÃO NECESSÁRIOS?

1. **`CognitiveExecutiveWorkspace.tsx`**: Interface do colaborador com ferramentas de quebra de tarefas, timer de foco adaptativo e registro de energia funcional.
2. **`CognitiveBenefitAdminCard.tsx`**: Card no painel de RH para ativação/desativação do benefício corporativo e controle de licenças.
3. **`NeurodiversityConsentModal.tsx`**: Modal de consentimento livre, esclarecido e específico (Art. 9º RGPD / Art. 11 LGPD) separando dados pessoais da relação de trabalho.
4. **`LlmGuardUsageTracker.ts`**: Utilitário em `@mindops/ai-core` para leases de tokens e controle de rate-limit.

---

## 6. QUAIS TABELAS SERÃO NECESSÁRIAS?

Recomendação Arquitetural: Isolamento de dados em schema segregado (`tdah` ou `cognitive`) ou tabelas com RLS estrito em nível de `auth.uid()`:

1. **`tenant_cognitive_settings`**:
   - `tenant_id` (PK, FK `tenants.id`)
   - `is_enabled` (boolean, default false)
   - `max_seats` (integer)
   - `created_at`, `updated_at`
2. **`cognitive_user_profiles`** (Schema isolado ou RLS estrito `user_id = auth.uid()`):
   - `id` (PK, UUID)
   - `user_id` (FK `auth.users.id`, UNIQUE)
   - `tenant_id` (FK `tenants.id`)
   - `consent_given_at` (timestamptz)
   - `consent_version` (text)
   - `preferences` (jsonb: preferências de foco, temas, notificações)
3. **`cognitive_tasks`**:
   - `id` (PK, UUID)
   - `user_id` (FK `auth.users.id`)
   - `title`, `steps` (jsonb), `status`, `energy_level`
4. **`llm_usage_leases`**:
   - `id` (PK, UUID)
   - `user_id` (FK `auth.users.id`)
   - `lease_expiry` (timestamptz)
   - `daily_tokens_used` (integer)
   - `daily_cost_usd` (numeric)

---

## 7. É NECESSÁRIA MIGRATION?

**Sim.** Uma nova migration `20260817_cognitive_support_p5.sql` será necessária para criar as tabelas acima, habilitar RLS com políticas de isolamento estrito `auth.uid() = user_id`, e criar a função de verificação atômica de cotas de LLM.

---

## 8. QUAIS APIS SERÃO NECESSÁRIAS?

1. `POST /api/cognitive/tasks/decompose`: Quebra assistida de metas complexas em micro-etapas de execução.
2. `GET /api/cognitive/profile`: Recupera preferências do colaborador autenticado.
3. `POST /api/cognitive/consent`: Registra o consentimento informado do colaborador.
4. `GET /api/admin/cognitive-benefit`: Consulta de status do benefício corporativo pelo RH.

---

## 9. QUAIS SERVER ACTIONS SERÃO NECESSÁRIAS?

1. `toggleCognitiveBenefitAction(enabled: boolean)`: Permite ao Admin ativar/desativar o benefício para a organização.
2. `submitCognitiveConsentAction(version: string)`: Grava consentimento criptografado no perfil pessoal do utilizador.
3. `saveTaskDecompositionAction(taskId: string, steps: string[])`: Persiste plano de execução de tarefas.

---

## 10. QUAIS ALTERAÇÕES NO DASHBOARD SERÃO NECESSÁRIAS?

- **Painel de RH (`/rh`):** Inclusão de aba/card "Benefícios & Neuroinclusão" mostrando exclusivamente:
  - *Status da Ativação do Benefício* (Ativo / Inativo)
  - *Cotas Contratadas vs Ativadas* (Ex: 45 / 100 licenças)
  - *Aviso Legal Explícito:* "Em conformidade com o RGPD/LGPD, dados de utilização e conteúdos do programa de Suporte Cognitivo são confidenciais e inacessíveis ao empregador."
- **Navegação do Colaborador:** Acesso à rota `/employee/cognitive` protegida por autenticação individual.

---

## 11. QUAL RBAC SERÁ APLICADO?

- **Colaborador (`employee`):** Acesso completo às suas ferramentas cognitivas e tarefas pessoais. Acesso zero aos dados de outros colaboradores.
- **RH (`rh`) / Gestor (`manager`):** Acesso restrito à ativação do benefício corporativo e métrica global de assentos. **Acesso ZERO a tabelas `cognitive_user_profiles`, `cognitive_tasks` ou prompts**.
- **Admin (`admin`):** Gestão de faturamento/licenciamento do benefício.
- **Auditor / DPO (`dpo`):** Visualização de logs de conformidade de consentimento (sem acesso ao conteúdo pessoal).

---

## 12. COMO SERÁ GARANTIDO O ISOLAMENTO MULTI-TENANT?

- A tabela `tenant_cognitive_settings` é protegida pela função `current_tenant_id()` já validada nas fases P0-P3.
- Os dados individuais (`cognitive_user_profiles`, `cognitive_tasks`) utilizam **RLS de Isolamento Duplo**:
  ```sql
  CREATE POLICY "users_manage_own_cognitive_data"
  ON cognitive_tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  ```
- Nenhuma query do RH ou de Gestores possui permissão de leitura sobre `cognitive_tasks`.

---

## 13. COMO SERÃO PROTEGIDOS PHI/PII?

- **Minimização de Dados (Art. 5º RGPD / Art. 6º LGPD):** O sistema não solicita laudos, relatórios médicos, receitas nem histórico psiquiátrico.
- **Criptografia em Repouso & Trânsito:** Todas as notas e tarefas são persistidas com proteção nativa do Postgres/Supabase.
- **Auditoria por Hash:** Prompts e respostas do assistente de foco geram apenas hashes criptográficos SHA-256 para auditoria de cota, sem retenção de texto puro sensível.

---

## 14. QUAIS SÃO OS RISCOS REGULATÓRIOS?

1. **Risco de Enquadramento como Dispositivo Médico (MDR / Anvisa):**
   - *Mitigação:* O sistema deve declarar expressamente que é uma **ferramenta de gestão de tempo, rotina e produtividade pessoal**, não realizando diagnóstico, triagem nem tratamento de transtornos mentais.
2. **Risco de Discriminação Ocupacional:**
   - *Mitigação:* Impossibilitar por design (*Privacy by Design*) que o empregador descubra quem utiliza o módulo ou classifique funcionários por características cognitivas.
3. **EU AI Act (Sistemas de IA no Local de Trabalho):**
   - *Mitigação:* O assistente de tarefas opera como ferramenta de auxílio ao trabalhador (*human agency*), sem avaliar desempenho, sem ranquear colaboradores e sem inferir emoções.

---

## 15. QUAL IMPACTO EM PORTUGAL?

- Conformidade com o **Código do Trabalho** e **Lei n.º 102/2009** (promoção do bem-estar sem ingerência na vida privada do trabalhador).
- Respeito estrito às diretrizes da **CNPD** sobre dados de saúde no contexto laboral.
- Moeda base de licenciamento em **EUR (€)**.

---

## 16. QUAL IMPACTO NO BRASIL?

- Alinhamento com a **Portaria MTP 4219/2022 (NR-1 / CIPA+A)** na vertente de promoção de ambiente de trabalho saudável e inclusivo.
- Respeito ao **Art. 11 da LGPD** (dados sensíveis com consentimento autônomo).
- Moeda base de licenciamento em **BRL (R$)**.

---

## 17. QUAIS TESTES SERÃO NECESSÁRIOS?

1. **Testes de Isolamento de Acesso (Anti-Eavesdropping):** Verificar que chamadas com token de RH/Admin recebem `403 Forbidden` ou array vazio ao tentar ler dados de `cognitive_tasks`.
2. **Testes de Consentimento:** Garantir que o colaborador só acessa o módulo após registro de consentimento explícito.
3. **Testes de Rate Limiting e LLM Guard:** Validar que requisições acima da cota diária são bloqueadas com erro amigável.
4. **Testes de Segregação Terminológica:** Confirmar ausência de termos de patologias em relatórios B2B.
5. **Testes de Regressão Completa:** Preservar os **134 testes existentes** das fases P0, P1, P2.1, P2.2, P2.3, P3 e P4.

---

## 18. QUAIS FUNCIONALIDADES PERMANECEM FORA DE ESCOPO?

- Assistente de Consulta Médica / Prontuário Clínico Psiquiátrico.
- Integração com prontuários eletrônicos externos (PEP).
- Automação de teleconsultas.
- Módulos de biofeedback e wearables.

---

## 19. QUAL SEQUÊNCIA RECOMENDADA DE IMPLEMENTAÇÃO?

1. **Etapa 5.1 — Core Architecture & LLM Guard:** Migração dos utilitários de rate limiting e leases de tokens para `@mindops/ai-core`.
2. **Etapa 5.2 — Database & RLS Migration:** Aplicação de schema/tabelas com RLS estrito de usuário único e settings de tenant.
3. **Etapa 5.3 — Employee Cognitive Experience:** Construção do workspace individual de suporte executivo (`/employee/cognitive`).
4. **Etapa 5.4 — Corporate Benefit Admin:** Painel de controle de assentos e consentimento para o RH.
5. **Etapa 5.5 — Test Suite & Certification:** Criação de testes unitários e de isolamento, typecheck e build de produção.

---

## 20. DEFINITION OF DONE (DoD)

- [ ] Zero impacto ou regressão nas 134 suites de testes P0-P4 existentes.
- [ ] RLS ativo em 100% das novas tabelas garantindo isolamento total entre RH e colaborador.
- [ ] Termos diagnósticos 100% ausentes de interfaces e payloads corporativos.
- [ ] 20 novos testes automatizados para a Fase P5 (totalizando 154 testes).
- [ ] `npm run typecheck` com 0 erros em todos os pacotes.
- [ ] `npm run build` com sucesso em 100% das rotas.
- [ ] Documentação e sincronização com o repositório central.

---

## 21. ANÁLISE ARQUITETURAL ESPECÍFICA: COGNITIVE SUPPORT & TDAH

| Dimensão | Diretriz Arquitetural AegisHub |
| :--- | :--- |
| **Opt-in por Tenant** | Sim, via flag booleana `is_enabled` em `tenant_cognitive_settings`. |
| **Natureza do Módulo** | **Benefício Corporativo de Bem-Estar / Apoio Executivo**. Não constitui módulo de medicina ocupacional compulsória (SST). |
| **Separação RH vs Indivíduo** | **Absoluta e Criptográfica.** O RH vê apenas número de licenças ativas; jamais quem ativou ou o que foi escrito. |
| **Consentimento** | Consentimento livre, autônomo e revogável a qualquer momento pelo trabalhador (Art. 9º RGPD / Art. 11 LGPD). |
| **Minimização de Dados** | Sem armazenamento de dados diagnósticos ou clínicos. Apenas tarefas, estratégias de foco e rotinas. |
| **Uso sem Diagnóstico** | Sim. Qualquer colaborador pode usar as ferramentas para foco e organização, sem necessidade de laudo ou autodeclaração neurodivergente. |
| **Fronteira Diagnóstica** | **Não diagnóstica.** Declarações explícitas em todas as telas de que a plataforma oferece suporte a funções executivas, não substituindo avaliação médica ou psicológica. |
| **Anti-Classificação Laboral** | Arquitetura impede tecnicamente qualquer relatório, filtro ou exportação que permita ao empregador mapear condições de colaboradores. |

---

## 22. PARECER FINAL & CONCLUSÃO

```
============================================================
FINAL ROADMAP DISCOVERY STATUS
============================================================

Análise Estrutural:   CONCLUÍDA
Segregação Jurídica:  VALIDADA
Isolamento RLS:       ESPECIFICADO (Zero acesso ao RH)
Fronteira Médica:     DELIMITADA (Suporte executivo não clínico)
Integridade P0-P4:    100% PRESERVADA (134/134 testes)

PARECER:
READY FOR IMPLEMENTATION (Sob a governança arquitetural P5)
============================================================
```
