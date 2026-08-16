# AVALIAÇÃO DE IMPACTO SOBRE A PROTEÇÃO DE DADOS (DPIA)
## ARQUITETURA TÉCNICA DE CONFORMIDADE (RGPD / LGPD / LEI 102/2009)

**Documento:** `DPIA_TECHNICAL_ASSESSMENT.md`  
**Data:** 17 de Agosto de 2026  
**Responsável Técnico:** Principal Enterprise Security & AI Compliance Architect  
**Aviso Legal Obrigatório:** *Este documento constitui uma avaliação de arquitetura técnica e engenharia de privacidade. A validação jurídica formal e o parecer final de conformidade cabem exclusivamente ao Encarregado de Proteção de Dados (DPO) e à assessoria jurídica da organização.*

---

## 1. ATIVIDADES DE TRATAMENTO DE DADOS (PROCESSING ACTIVITIES)

O AegisHub AI processa dados estritamente no contexto de **Saúde e Segurança no Trabalho (SST)** e **Suporte Cognitivo Ocupacional**, divididos em 4 pilares:
1. **Avaliação Psicossocial Ocupacional:** Coleta de percepções ergonômicas e sobrecarga de trabalho para prevenção coletiva (Lei 102/2009 / NR-1).
2. **Plano de Intervenção SST:** Gestão e acompanhamento de medidas corretivas organizacionais.
3. **Relatórios Regulatórios de Conformidade:** Geração de laudos estatísticos e dossiês de auditoria para ACT (PT) e MTE (BR).
4. **Suporte Cognitivo Ocupacional (B2B Benefit):** Assistência executiva privada para colaboradores (decomposição de tarefas complexas via LLM com quota diária).

---

## 2. CATEGORIAS DE DADOS & BASES LEGAIS

| Categoria de Dados | Tabelas Afetadas | Finalidade | Base Legal (RGPD) | Base Legal (LGPD) |
| :--- | :--- | :--- | :--- | :--- |
| **Identificadores Pessoais** | `users`, `tenant_memberships` | Autenticação, controle de acesso e segregação multi-tenant | Art. 6(1)(b) (Execução de Contrato) | Art. 7(V) |
| **Dados Psicossociais Agregados** | `campaign_aggregates`, `dimension_scores` | Mitigação de riscos organizacionais coletivos | Art. 6(1)(c) (Obrigação Legal SST) | Art. 7(II) (Cumprimento Legal) |
| **Dados de Suporte Cognitivo** | `cognitive_tasks`, `cognitive_user_profiles` | Apoio executivo privado e gestão de foco | Art. 6(1)(a) / Art. 9(2)(a) (Consentimento Explícito) | Art. 7(I) / Art. 11(I) |
| **Consumo de IA & Quotas** | `llm_usage_leases` | Governança de custos e prevenção de abuso | Art. 6(1)(f) (Legítimo Interesse) | Art. 7(IX) |
| **Trilha de Auditoria de Privacidade** | `privacy_audit_events` | Registro probatório de exercício de direitos | Art. 6(1)(c) (Responsabilidade Probatória) | Art. 7(II) |

---

## 3. CONTROLES DE ACESSO & ISOLAMENTO (RBAC & RLS)

1. **Row Level Security (RLS) Mandatório:** 100% das tabelas do banco de dados operam com RLS ativo vinculado a `tenant_id` e `auth.uid()`.
2. **Segregação de Papéis (RBAC):**
   - `colaborador`: Acesso exclusivo às próprias tarefas cognitivas e histórico de consentimento.
   - `rh` / `manager`: Acesso estrito a relatórios organizacionais agregados com **k-anonymity** ($N \ge 5$ para SST e $N \ge 20$ para benefício cognitivo).
   - `sst_professional` / `dpo`: Acesso a planos de ação e trilhas de conformidade regulatória.
   - `admin`: Gestão de workspaces sem acesso a dados clínicos individuais.

---

## 4. PROCESSAMENTO DE IA & GOVERNANÇA (EU AI ACT)

1. **Privacidade de Prompts:** Prompts e respostas do módulo cognitivo **não** são armazenados em texto claro em logs corporativos. O sistema gera apenas hashes SHA-256 (`promptHash`, `responseHash`) para auditoria de integridade.
2. **Isolamento B2B:** Empregadores e gestores possuem **zero visibilidade** sobre o conteúdo das tarefas cognitivas individuais de seus empregados.
3. **LLM Financial Guard:** Quota restrita a \$0.25/dia por utilizador para mitigar riscos de dependência ou uso indevido.

---

## 5. POLÍTICAS DE RETENÇÃO E CICLO DE VIDA (DATA RETENTION)

| Categoria | Período de Retenção | Mecanismo de Expiração | Justificativa Legal |
| :--- | :---: | :--- | :--- |
| **Tarefas Cognitivas Pessoais** | 90 dias ou até deleção | Soft-delete / Hard-delete pelo utilizador | Minimização de dados |
| **Sessões e Respostas Psico.** | 5 anos | Arquivamento anonimizado | Lei 102/2009 / NR-1 |
| **Laudos e Planos SST** | 5 anos | Preservação imutável | Fiscalização ACT / MTE |
| **Trilha de Auditoria de Privacidade** | 7 anos | Imutabilidade em tabela auditada | Prazo prescricional de auditoria |

---

## 6. DIREITOS DOS TITULARES (DATA SUBJECT RIGHTS)

1. **Direito de Acesso e Portabilidade:** Endpoint `GET /api/privacy/export` entrega JSON estruturado contendo histórico de perfil, consentimentos e tarefas cognitivas.
2. **Direito ao Esquecimento (Erasure):** Endpoint `DELETE /api/privacy/me` executa a eliminação imediata de tarefas cognitivas, perfis individuais e revogação de consentimentos, preservando apenas agregados legais anonimizados (Art. 17(3)(b) RGPD).
3. **Direito de Revogação do Consentimento:** A revogação do consentimento interrompe imediatamente o consumo de modelos de IA para o colaborador.

---

## 7. MATRIZ DE RISCO & MITIGAÇÕES TÉCNICAS

| Risco Identificado | Impacto | Mitigação Técnica Implementada | Risco Residual |
| :--- | :---: | :--- | :---: |
| Vazamento de dados cognitivos para gestores | Alto | RLS por `user_id = auth.uid()` e threshold $N \ge 20$ | **Baixo** |
| Acesso indevido cross-tenant | Crítico | Validação server-side de `tenant_membership` em todas as rotas | **Baixo** |
| Excesso de coleta em análises de voz | Médio | Extração estrita de prosódia/latência sem inferência emocional/biométrica invasiva | **Baixo** |
| Falha no cumprimento de eliminação | Médio | Endpoint transacional atômico `DELETE /api/privacy/me` | **Muito Baixo** |
