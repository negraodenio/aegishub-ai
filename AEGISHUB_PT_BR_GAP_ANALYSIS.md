# ANÁLISE DE LACUNAS & MAPEAMENTO COMPARATIVO (GAP ANALYSIS)
## AegisHub AI — Mercados Portugal (PT) e Brasil (BR)

---

### 1. Visão Comparativa Regulamentar e Comercial

| Dimensão | 🇵🇹 Portugal (PT) | 🇧🇷 Brasil (BR) | Estratégia de Unificação AegisHub |
| :--- | :--- | :--- | :--- |
| **Principal Marco Legal** | Lei n.º 102/2009 (Regime jurídico da promoção da SST) | Norma Regulamentadora nº 01 (NR-1) — GRO / PGR | Perfil Jurisdicional (`CountryProfile`) com termos, regras e enquadramentos dinâmicos. |
| **Foco Psicossocial** | Avaliação e prevenção de riscos psicossociais no trabalho | Identificação de perigos psicossociais e riscos à saúde dos trabalhadores | Motor de Avaliação Composto compartilhado (`score-composer` + COPSOQ/Worker Voice). |
| **Estrutura de Gestão** | Programa de Prevenção e Avaliação de Riscos (Art. 15º) | 1. Inventário de Riscos Ocupacionais<br>2. Plano de Ação do PGR | Mesma estrutura `assessments` $\to$ `risks` $\to$ `corrective_actions` mapeada para ambos. |
| **Participação do Trabalhador** | Consulta e informação aos trabalhadores (Art. 18º) | Participação e percepção dos trabalhadores (NR-1.5.3.3) | Módulo **Worker Voice** (avaliação agregada focada na organização do trabalho, não em patologias). |
| **Canal de Denúncia** | Lei n.º 93/2021 (Proteção de denunciantes) | Canal de Ética e Denúncias (Lei 14.457/2022 CIPA+A) | Portal `sos_sessions` unificado com classificação semântica e SLA. |
| **Direito à Desconexão** | Lei n.º 83/2021 (Dever de abstenção de contacto) | CLT Art. 244/NR-17/Súmula 428 TST (Sobrecarga) | Indicador **Organizational Disconnect Risk** (métricas agregadas de sobrecarga/jornada). |
| **Privacidade & Dados** | RGPD (Regulamento UE 2016/679) | LGPD (Lei nº 13.709/2018) | Termos de consentimento versionados (`consent_logs`) com base legal específica (PT/BR). |
| **Relatórios Oficiais** | Relatório de Riscos ACT & Relatório Anual Anexo D | Relatório de Gestão de Riscos NR-1 / PGR | Gerador de PDF dinâmico com templates específicos por jurisdição. |
| **Identificadores Fiscais** | NIPC / NIF, CAE, Código ACT | CNPJ, CNAE, Grau de Risco | Campos polimórficos de identificação da empresa cliente. |

---

### 2. Lacunas e Adaptações em Portugal (PT)

#### 2.1 O Que Já Existe no Código
* ✅ Instrumentos COPSOQ-II (Short e Full com percentis 40/60) e cálculo de scores.
* ✅ Canal de Denúncia em conformidade com a Lei 93/2021 com SLA de 15 minutos em `sos/actions.ts`.
* ✅ Gestão de consentimento para tratamento de dados psicossociais e áudio técnico.
* ✅ Templates de PDF para Relatório ACT e Relatório Anexo D.
* ✅ Mapeamento de unidades de negócio e mapa de calor organizacional.

#### 2.2 O Que Falta Implementar / Refinar
1. **Indicador de Risco de Desconexão (Lei 83/2021):**
   * *Lacuna:* Menções no código ocorrem em mock data (`AegisRiskAuditPDF.ts`).
   * *Ação:* Criar cálculo explícito de `Organizational Disconnect Risk` a partir das dimensões de ritmo de trabalho, exigências quantitativas e horários de trabalho.
2. **Ciclo Fechado de Ações (Art. 15º Lei 102/2009):**
   * *Lacuna:* Tabela `corrective_actions` possui status e prioridade, mas não registra evidências de implementação nem data de reavaliação de eficácia.
   * *Ação:* Estender `corrective_actions` com campos de evidência e fluxo de reavaliação.
3. **Limpeza de Terminologia:**
   * *Lacuna:* Expressões como "diagnóstico de aptidão" precisam ser substituídas por "avaliação de riscos psicossociais" ou "indicador de risco psicossocial".

---

### 3. Lacunas e Adaptações no Brasil (BR / NR-1)

#### 3.1 O Que Já Existe Que Pode Ser 100% Reutilizado
* ✅ Motor de isolamento multi-tenant (`tenants`, `profiles`, `employees`).
* ✅ Motor de cálculo de riscos e ponderação por setor/vertical (`score-composer.ts`).
* ✅ Motor de Ações Corretivas / Preventivas (`corrective_actions`).
* ✅ Sistema de Alertas e Triagem de Emergência (`risk_alerts`, `care_referrals`).
* ✅ Trilha de auditoria e explicabilidade de IA (`ai_decisions`, `ai_audit_logs`).
* ✅ Sistema de tokens de avaliação anonimizada (`WorkerWizard.tsx`, `assessment-service.ts`).

#### 3.2 O Que Falta Implementar Para o Brasil
1. **Perfil Jurisdicional BR (`CountryProfile = "BR"`):**
   * Idioma: Português do Brasil (PT-BR).
   * Moeda: BRL (R$).
   * Marco Legal: NR-1 (GRO/PGR), Portaria MTP 4.219/2022, Lei 14.457/2022.
   * Terminologia: CNPJ, CNAE, Unidade/Setor/Processo, Perigo/Fator de Risco, Nível de Risco, Medida de Prevenção.
2. **Módulo Worker Voice (Participação dos Trabalhadores - NR-1.5.3.3):**
   * Formulário adaptado de percepção dos fatores organizacionais do trabalho (Carga de trabalho, Clareza de papéis, Autonomia, Suporte da liderança, Relações interpessoais, Reconhecimento).
   * Resultados agregados por Organização, Unidade, Setor e Período (sem exposição individual).
3. **Mapeamento do PGR (Inventário de Riscos + Plano de Ação):**
   * Hierarquia ocupacional: Organização $\to$ Unidade $\to$ Setor $\to$ Processo/Atividade $\to$ Fator de Risco $\to$ Avaliação $\to$ Medida Preventiva $\to$ Responsável $\to$ Prazo $\to$ Evidência $\to$ Avaliação de Eficácia $\to$ Reavaliação.
4. **Relatório de Gestão de Riscos NR-1 (PDF):**
   * Documento estruturado para compor o inventário de riscos e plano de ação do PGR da empresa cliente.
5. **Ajuste de Governança LGPD:**
   * Termos de consentimento e finalidade de tratamento alinhados aos artigos 7º e 11º da LGPD (dados sensíveis no ambiente do trabalho).

---

### 4. Mapeamento de Entidades do Banco de Dados

| Conceito de Negócio | Tabela Atual Supabase | Adaptação / Extensão Sem Duplicação |
| :--- | :--- | :--- |
| **Organização / Empresa** | `tenants` | Adicionar coluna `country_code` (`'PT'` ou `'BR'`, default `'PT'`) e campos fiscais (`tax_id`, `economic_activity_code`). |
| **Unidade / Setor / Processo** | `employees` | Reutilizar `business_unit`, `department`, `site_name` e adicionar `process_activity`. |
| **Fatores de Risco & Avaliação** | `assessment_sessions` / `assessment_scores` | Adicionar metadados de metodologia (`methodology`, `instrument_version`, `evaluator_name`). |
| **Medidas Preventivas / Plano de Ação** | `corrective_actions` | Adicionar `evidence_notes`, `evidence_url`, `effectiveness_rating`, `reassessment_date`, `responsible_name`. |
| **Consentimento & Privacidade** | `consent_logs` | Reutilizar para RGPD e LGPD com parametrização de base legal e versão de termos. |
| **Canal de Denúncias & Apoio** | `sos_sessions` / `sos_messages` | Reutilizar 100% para Lei 93/2021 (PT) e Canal de Ética CIPA+A (BR). |
| **Trilha de Auditoria IA** | `ai_decisions` / `ai_audit_logs` | Reutilizar 100% para conformidade com EU AI Act (PT) e boas práticas de IA ética (BR). |

---
*Análise de Lacunas concluída. Nenhuma duplicata de engine ou banco será criada.*
