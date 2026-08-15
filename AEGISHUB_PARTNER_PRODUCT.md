# PROPOSTA DE VALOR & PRODUTO COMERCIAL PARA PARCEIROS DE SST
## AegisHub AI — Technology Partner for Occupational Health & Safety

---

### 1. Posicionamento de Mercado: "Technology Partner for SST"

O **AegisHub AI** não concorre com as empresas de SST, clínicas de medicina do trabalho ou consultorias de psicologia organizacional. O AegisHub posiciona-se como o **parceiro tecnológico estratégico** que empodera essas entidades com inteligência artificial, automação de dados e geração contínua de evidências.

> **Princípio Central de Parceria:**  
> *"As empresas de SST mantêm a responsabilidade técnica, a emissão de laudos, pareceres e a responsabilidade profissional perante os órgãos reguladores. O AegisHub AI fornece a infraestrutura tecnológica de ponta: coleta digital anonimizada, motores de IA para detecção de tendências, planos de ação dinâmicos e relatórios pré-estruturados para auditoria."*

---

### 2. Os 6 Pilares da Plataforma Comercial

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AEGISHUB AI                                   │
│            AI-Powered Psychosocial Risk Intelligence                    │
├─────────────────┬───────────────────┬───────────────────────────────────┤
│  01. ASSESSMENT │ 02. RISK INTEL    │ 03. AI INTELLIGENCE               │
│  Coleta Segura  │ Mapas de Calor    │ Suporte à Decisão                 │
│  e Anonimizada  │ e Índices Setor   │ e Explainability M2.7             │
├─────────────────┼───────────────────┼───────────────────────────────────┤
│  04. ACTION MGMT│ 05. CONTINUOUS MON│ 06. EVIDENCE & COMPLIANCE         │
│  Medidas SST e  │ Tendências e      │ Relatórios Oficiais               │
│  Plano de Ação  │ Alertas Precoces  │ ACT (PT) / PGR NR-1 (BR)          │
└─────────────────┴───────────────────┴───────────────────────────────────┘
```

#### Pilar 01 — Assessment (Coleta Inteligente & Segura)
* **Funcionalidade Real:** Questionários ocupacionais digitais com links e tokens criptografados e descartáveis (`WorkerWizard.tsx`).
* **Instrumentos Disponíveis:** COPSOQ-II (curto e estendido com percentis 40/60), GAD-7, PHQ-9 e Worker Voice adaptado para a organização do trabalho.
* **Garantia de Privacidade:** Respostas isoladas em silo anônimo, sem qualquer vínculo direto legível por gestores de RH.

#### Pilar 02 — Psychosocial Risk Intelligence (Inteligência de Riscos)
* **Funcionalidade Real:** Matriz de risco multidimensional por unidade de negócio, departamento, turno e processo operacional (`RiskHeatmap.tsx`, `score-composer.ts`).
* **Indicadores:** Score de Risco Composto (0-100), Fatores Críticos de Carga Mental, Índice de Risco de Desconexão e Dispersão de Respostas.

#### Pilar 03 — AI Intelligence (Apoio à Decisão com Supervisão Humana)
* **Funcionalidade Real:** Motor de inferência assistiva M2.7 (`human-in-the-loop.ts`, `ai-core/guardrails.ts`).
* **Governança:** Sugestões explicáveis para priorização de intervenções com trava obrigatória de validação por técnicos ou médicos de SST (em estrito alinhamento ao EU AI Act Art. 14º).

#### Pilar 04 — Action Management (Gestão do Ciclo de Prevenção)
* **Funcionalidade Real:** Fila de ações preventivas e corretivas com atribuição de responsável, prazo, prioridade e status (`corrective_actions`, `ActionQueueTable.tsx`).
* **Ciclo Fechado:** Rastreamento do ciclo completo: *Identificação $\to$ Ação $\to$ Evidência $\to$ Verificação de Eficácia $\to$ Reavaliação*.

#### Pilar 05 — Continuous Monitoring (Vigilância Preventiva Contínua)
* **Funcionalidade Real:** Painel de monitoramento de tendências, taxas de cobertura de campanhas e disparos de alertas de sobrecarga (`rh/page.tsx`, `risk_alerts`).
* **Canais Integrados:** Portal de integridade com canal de denúncias confidencial (Lei 93/2021 em PT / CIPA+A no BR) e triagem preventiva 24/7.

#### Pilar 06 — Evidence & Compliance (Evidências & Relatórios Regulatórios)
* **Funcionalidade Real:** Geração instantânea de relatórios executivos e regulatórios em formato PDF auditável:
  * **Portugal:** Relatório de Avaliação de Riscos Psicossociais (Lei 102/2009 ACT) e Relatório Anual de Atividades de SST (Anexo D).
  * **Brasil:** Relatório de Gestão de Riscos Psicossociais (Inventário de Riscos e Plano de Ação do PGR — NR-1).
* **Trilha de Auditoria:** Registro imutável de todas as submissões e revisões humanas com data e hora.

---

### 3. Modelo Comercial para Parceiros e Operadores de SST

1. **Parceiro White-Label / Co-Branded:** Empresas de SST podem disponibilizar a plataforma para centenas de empresas clientes sob sua gestão.
2. **Escala Operacional:** Substituição de questionários manuais em papel e planilhas por links seguros que geram relatórios consolidados em segundos.
3. **Novas Fontes de Receita:** Prestadores de SST podem ofertar programas contínuos de gestão de risco psicossocial com receita recorrente mensal (SaaS + Consultoria Especializada).
4. **Segurança Jurídica:** Documentação técnica blindada, com trilha de auditoria completa pronta para inspeções de trabalho (ACT em Portugal ou Ministério do Trabalho e Emprego no Brasil).

---
*Documento de Produto para Parceiros homologado para subsidiar a estratégia comercial e os materiais da Landing Page.*
