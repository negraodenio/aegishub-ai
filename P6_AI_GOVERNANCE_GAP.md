# P6 AI GOVERNANCE & EU AI ACT READINESS
**Documento:** `P6_AI_GOVERNANCE_GAP.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise AI Compliance Architect

---

## 1. AI MODEL REGISTRY (INVENTÁRIO DE MODELOS DE IA)

| Modelo / Pipeline | Provedor | Versão | Finalidade | Classificação EU AI Act | Dados Processados | Supervisão Humana | Fallback | Custo Médio | Status |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- | :---: | :---: |
| **SST Intervention Recommender** | Gemini / OpenAI | `v2.2-sst` | Recomendação de medidas preventivas de ergonomia | **Alto Risco** (Ambiente de Trabalho) | Indicadores agregados por setor | ✅ Obrigatória (`ai_decisions`) | Matriz estática de SST | $0.003 / req | **DEPLOYED** |
| **Cognitive Task Decomposer** | Gemini / OpenAI | `v5.0-cog` | Quebra de tarefas em micro-etapas de foco | **Risco Baixo / Mínimo** (Apoio Pessoal) | Título e descrição de tarefas do colaborador | Colaborador direto | Regras heurísticas locais | $0.0007 / req | **DEPLOYED** |
| **Acoustic Biomarker Analyzer** | Algoritmo Local | `v1.0-acoustics` | Avaliação de ritmo de fala e estresse acústico | **Alto Risco** (Biometria Acústica) | Buffer de áudio (Pitch / Jitter) | ✅ Médico / SST | Questionário de autorrelato | $0.00 / req | **DEPLOYED** |
| **Regulatory Report Summarizer** | Gemini / OpenAI | `v2.3-report` | Síntese de textos e justificativas de conformidade | **Risco Baixo** | Agregados numéricos mascarados | ✅ DPO / Auditor | Template regulatório padrão | $0.005 / req | **DEPLOYED** |

---

## 2. GOVERNANÇA DE PROMPTS & GUARDRAILS

- **Repositório Central de Prompts:** Prompts de sistema versionados semanticamente (`PROMPT_SST_INTERVENTION_V2_2`, `PROMPT_TASK_DECOMPOSER_V5_0`).
- **Guardrails Algorítmicos Ativos (`packages/ai-core/src/guardrails.ts` & `llm-guard.ts`):**
  - **Filtro Anti-Diagnóstico:** Bloqueia automaticamente qualquer saída contendo "diagnóstico", "TDAH", "autismo", "transtorno", "medicamento", "CID-10", "DSM-5".
  - **Filtro Anti-Classificação:** Impede criação de rankings ou notas de produtividade de colaboradores.

---

## 3. RASTREABILIDADE & AI AUDIT TRAIL

Todas as chamadas aos modelos de IA geram registros imutáveis nas tabelas:
1. `ai_decisions`: Armazena `model_name`, `model_version`, `prompt_hash`, `reasoning_factors`, `recommended_action`, `confidence_score` e `validation_status`.
2. `ai_audit_logs`: Armazena `decision_id`, `actor_id`, `action` (`approved`, `rejected`, `overridden`), `rationale` e `created_at`.

---

## 4. FLUXO DE GESTÃO DE INCIDENTES DE IA (AI INCIDENT MANAGEMENT)

```
[ANOMALIA / DRIFT DETECTADO]
            ↓
[ISOLAMENTO DO MODELO] ───> Ativação automática de Fallback Heurístico Estático
            ↓
[AUDITORIA DE HASHES] ────> Análise de prompt_hash e response_hash sem expor PII
            ↓
[REVISÃO HUMANA DPO] ─────> Ajuste de guardrails e revalidação de conformidade
            ↓
[RESTABELECIMENTO] ───────> Reativação com novo versionamento semântico
```
