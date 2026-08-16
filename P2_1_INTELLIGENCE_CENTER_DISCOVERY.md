# P2.1 — INTELLIGENCE CENTER DISCOVERY & AUDIT REPORT
**Documento:** `P2_1_INTELLIGENCE_CENTER_DISCOVERY.md`  
**Data:** 16 de Agosto de 2026  
**Auditor:** Principal Software Architect & AI Governance Specialist  
**Fase:** P2.1 Discovery (Auditoria Prévia sem Alteração de Código)

---

## 1. COMPONENTES AUDITADOS NO INTELLIGENCE CENTER

A auditoria inspecionou todos os arquivos da rota `/rh/intelligence`:
1. [`apps/web/app/(dashboard)/rh/intelligence/page.tsx`](file:///c:/Users/denio/Documents/Denio/PTSaude/apps/web/app/(dashboard)/rh/intelligence/page.tsx) — Página principal do Intelligence Center.
2. [`apps/web/features/rh-dashboard/components/DriftMatrixCard.tsx`](file:///c:/Users/denio/Documents/Denio/PTSaude/apps/web/features/rh-dashboard/components/DriftMatrixCard.tsx) — Card de métricas de estabilidade e drift.
3. [`apps/web/features/rh-dashboard/components/PatchFeedList.tsx`](file:///c:/Users/denio/Documents/Denio/PTSaude/apps/web/features/rh-dashboard/components/PatchFeedList.tsx) — Feed de supostos "patches automáticos".
4. [`apps/web/features/rh-dashboard/components/HumanValidationQueue.tsx`](file:///c:/Users/denio/Documents/Denio/PTSaude/apps/web/features/rh-dashboard/components/HumanValidationQueue.tsx) — Fila de validação humana (Human-in-the-Loop).

---

## 2. ARRAYS HARDCODED E MOCKS ENCONTRADOS

| Arquivo | Linha | Array / Objeto Mock | Conteúdo Fictício |
| :--- | :---: | :--- | :--- |
| `HumanValidationQueue.tsx` | L6–L25 | `const initialQueue = [...]` | 2 decisões falsas (`dec-v9` com 98% conf, `dec-v10` com 82% conf). Ações de aprovar/rejeitar apenas filtram o array em memória React, sem persistência no Supabase. |
| `PatchFeedList.tsx` | L4–L29 | `const patches = [...]` | 3 patches fictícios (`patch-82`, `patch-81`, `patch-80`) simulando alterações de prompt e thresholds automáticos. |

---

## 3. NÚMEROS FIXOS E ESTATÍSTICAS ARTIFICIAIS

| Arquivo | Linha | Valor Fixo | Descrição |
| :--- | :---: | :--- | :--- |
| `DriftMatrixCard.tsx` | L24 | `±1.2%` | Variância de GAD-7 fixa sem base em amostras reais. |
| `DriftMatrixCard.tsx` | L34 | `2.4%` | Taxa de Falso Positivo fixa. |
| `DriftMatrixCard.tsx` | L43, L46 | `0.71 → 0.68`, `68%` | Ajuste de Sampling Temperature fictício. |
| `page.tsx` | L51 | `400 intervenções T1` | Menção estática a 400 intervenções inexistentes. |
| `page.tsx` | L58 | `FOUND 12 MATCHING INCIDENTS [SIMILARITY 0.9412]` | Similarity score e contagem de incidentes hardcoded. |
| `page.tsx` | L70 | `+18% RELAPSE DETECTED` | Inferência estatística fictícia. |

---

## 4. CLAIMS FALSOS / ESTÉTICA DE FICÇÃO CIENTÍFICA

Foram identificadas 9 alegações que não possuem evidência no banco de dados e devem ser removidas ou reenquadradas:
1. 🔴 **"Autonomous Workflow Rewriter" / "LIVE PATCHING":** Afirma que a IA altera o código/scaffold em tempo real.
2. 🔴 **"MiniMax detectou fadiga oculta. Baseline ajustada de 60 para 55":** Nenhuma rotina ajusta baselines silenciosamente.
3. 🔴 **"Fusão de Regras GAD-7: Unificação de gatilhos de alerta entre Operações e Atendimento":** Nenhuma fusão de regras ocorre.
4. 🔴 **"Calibração de Loop de Decisão: Penalty adicionado na prompt memory":** Nenhuma memória de prompt adaptativa em produção.
5. 🔴 **"Live Tensor Stream" / Binários fictícios (`01011001` / `11001010`):** Animação decorativa que simula queries vetoriais que não foram disparadas.
6. 🔴 **"APPLYING MANDATORY 4-DAY ROTATION TO AVOID +18% RELAPSE":** A IA não tem autoridade clínica para prescrever rotações compulsórias de escala sem validação médica.
7. 🔴 **"Core M2.7 Online":** Badge estático desvinculado do health check real dos modelos.
8. 🔴 **"Estabilidade das inferências clínicas nos últimos 30 dias (±1.2%)":** Ausência de cálculo baseado em janelas temporais de `ai_audit_logs`.
9. 🔴 **"A operação autônoma está fluindo perfeitamente":** Mensagem de empty state com tom de automação não-supervisionada.

---

## 5. DADOS REAIS QUE JÁ EXISTEM NO BANCO DE DADOS

O banco de dados Supabase possui tabelas reais e estruturadas que serão a base da nova camada de Governança de IA:
1. `public.ai_decisions`:
   - `id`, `tenant_id`, `created_at`, `input_hash`, `output_hash`, `model_used`, `model_version`, `score`, `vertical`, `decision`, `reasons`, `recommendation`, `risk_level`, `requires_human_review`, `human_validated`, `human_action`, `human_feedback`, `memory_updates`.
2. `public.ai_audit_logs`:
   - `id`, `decision_id`, `timestamp`, `action`, `actor`, `details`, `old_memory`, `new_memory`, `scaffold_changes`.
3. `public.assessment_scores`:
   - `id`, `session_id`, `composite_risk_score`, `risk_level`, `confidence`, `reasons`, `scored_at`.
4. `public.campaigns`:
   - `id`, `tenant_id`, `code`, `title`, `country_code`, `status`.

---

## 6. O QUE NÃO EXISTE NO BANCO (E NÃO DEVE SER INVENTADO)

- ❌ Nenhuma tabela de patches de código ao vivo (`live_patches` não existe).
- ❌ Nenhum pipeline contínuo de embeddings em tempo real para incidentes organizacionais históricos.
- ❌ Nenhuma matriz de drift calculada quando o tenant tem menos de 100 avaliações auditadas.

---

## 7. ARQUITETURA ALVO & PLANO DE IMPLEMENTAÇÃO P2.1

### A. Reposicionamento Institucional
O **Intelligence Center** é transformado em **AegisHub AI Governance Center** (Conformidade com o Regulamento Europeu de IA — *EU AI Act* / ISO 42001).

### B. Módulos do Novo Dashboard de Governança:
1. **Header Institucional:** Organização ativa, Jurisdição, Papel RBAC (`AI_GOVERNANCE`, `DPO`, `AUDITOR`, `ADMIN`), status real do modelo.
2. **KPIs de Governança Reais:** Total de Decisões de IA do Tenant, Decisões com Validação Humana Pendente, Decisões Aprovadas/Rejeitadas, Taxa de Concordância Humano-IA (calculada de dados reais ou com badge *"Amostra insuficiente (N < 30)"*).
3. **Fila de Validação Humana Persistida (Human-in-the-Loop):**
   - Conectada diretamente a `public.ai_decisions` filtrada por `tenant_id` e `status = 'pending'` (ou `requires_human_review = true` e `human_validated IS NULL`).
   - Botões "Aprovar Decisão" e "Rejeitar Decisão" executam Server Action que persiste em `ai_decisions` e grava log imutável em `ai_audit_logs`.
4. **Log de Auditoria e Explicabilidade (AI Audit Trail):**
   - Tabela conectada a `public.ai_audit_logs` exibindo timestamp, modelo (`model_used`), decisão (`decision_type`), evidências estruturadas (`reasons`), nível de risco e autor da revisão humana.
5. **Matriz de Performance e Calibração:**
   - Exibe a distribuição de confiança média das inferências reais de `assessment_scores` e `ai_decisions`.
   - Se houver menos de 30 amostras: exibe o estado neutro *"Aguardando consolidação de dados de auditoria (N < 30)"*.
6. **Explicabilidade de Decisão & Memória Organizacional:**
   - Visualização de decisão estruturada com Veredito, Fatores de Risco ponderados, Confiança e Veto/Aprovação de Especialista Humano.
7. **Isolamento Multi-Tenant & RBAC:**
   - Todas as consultas executadas com `resolveTenantContext({ requiredRoles: ["admin", "ai_governance", "dpo", "auditor", "sst_professional"] })`.
   - Proteção estrita: Tenant A não tem acesso a nenhuma decisão ou log do Tenant B.
   - Segregação de PHI: O RH comum não acessa detalhes clínicos ou parâmetros técnicos individuais.
