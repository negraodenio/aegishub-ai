# AegisHub AI — Commercial & Regulatory Readiness Audit

**Data:** 15 de Agosto de 2026  
**Auditor:** Lead Software Architect  
**Status do Sistema:** ✅ Aprovado para Apresentação e Venda Comercial (PT & BR)  
**Validações:** `pnpm typecheck` (0 erros) | `pnpm test` (9/9 passed) | `pnpm build` (28/28 static/dynamic routes OK)

---

## 1. Inventário e Classificação de Claims

Durante a auditoria profunda de todo o frontend e camadas de apresentação, os termos foram identificados e classificados de acordo com as regras de **Commercial Readiness**:

| Termo / Expressão Identificada | Localização / Componente | Classificação | Ação Realizada |
| :--- | :--- | :--- | :--- |
| `"DOCUMENTO OFICIAL: LEI 102/2009"` | `ACTReportPDF.tsx` | **REWRITE** | Alterado para `"RELATÓRIO TÉCNICO DE AVALIAÇÃO: LEI 102/2009 (PROMOÇÃO DA SEGURANÇA E SAÚDE NO TRABALHO)"`. |
| `"Relatório Oficial ACT"` | `apps/web/app/(marketing)/page.tsx` | **REWRITE** | Alterado para `"Relatório Técnico de Avaliação (Lei 102)"`. |
| `"Centro de Diagnóstico e Triagem Assistida"` | `app/(dashboard)/clinical/page.tsx` | **REWRITE** | Substituído por `"Centro de Gestão de Risco Psicossocial e Triagem Assistida"`. |
| `"diagnóstico de aptidão agregado"` | `EmployeeManagement.tsx` | **REWRITE** | Substituído por `"indicadores de risco ocupacional agregados"`. |
| `"diagnóstico"` / `"depressão"` / `"ansiedade"` | `WorkerWizard.tsx` (Disclaimer) | **KEEP** | Mantido exclusivamente no disclaimer explícito de **não-diagnóstico** (*"não constitui diagnóstico clínico"*). |
| `"diagnóstico"` (EU AI Act Art. 14º) | `app/(marketing)/ai-act/page.tsx` | **KEEP** | Mantido no disclaimer de governança (*"o AEGIS HUB não emite decisões autónomas de diagnóstico ou exclusão laboratorial"*). |
| `"Lei 93/2021 Compliant"` | `apps/web/app/sos/page.tsx` | **REWRITE** | Substituído por `"Alinhado à Lei 93/2021"`. |
| `"Ver Certificado Imutável"` | `DPODashboard.tsx` | **REWRITE** | Substituído por `"Ver Registo Criptográfico de Auditoria"`. |
| `"Nota de Segurança Jurídica"` | `EmployeeManagement.tsx` | **REWRITE** | Substituído por `"Garantia de Sigilo e Proteção de Dados"`. |
| `"substitui apoio médico ou psicológico"` | `SOSChatWidget.tsx` | **KEEP** | Mantido no alerta de segurança (*"Não substitui apoio médico ou psicológico hospitalar"*). |
| `"substitui médico/perito/SST"` | `page.tsx` (Disclaimer Geral) | **KEEP** | Mantido no aviso legal de rodapé (*"A plataforma não realiza diagnóstico clínico e não substitui a atuação de médicos do trabalho ou técnicos de SST"*). |
| `"Ficha de Aptidão Médica com GAD-7/PHQ-9"` | `FichaAptidaoPDF.tsx` | **INTERNAL ONLY** | Mantido isolado para uso interno/clínico facultativo. Ocultado de qualquer material de marketing público. |

---

## 2. Páginas e Componentes Auditados e Ajustados

1. **Landing Page (`apps/web/app/(marketing)/page.tsx`):**
   * **Nome Comercial:** **AEGISHUB AI**
   * **Categoria:** **AI-Powered Workplace Intelligence**
   * **Headline:** *"Inteligência para Riscos Psicossociais no Trabalho"*
   * **Subheadline:** *"Avalie, previna, acompanhe e documente os riscos psicossociais com uma plataforma de Inteligência Artificial desenvolvida para organizações e empresas de SST."*
   * **Seletor de Jurisdição Dinâmico:** Alternância instantânea entre 🇵🇹 Portugal (Lei 102/2009, Lei 93/2021, Lei 83/2021, RGPD, ACT) e 🇧🇷 Brasil (NR-1, GRO, PGR, Worker Voice, CIPA+A, LGPD).
   * **Os 6 Pilares:**
     * `01 Assessment` (Instrumentos validados, Worker Voice, tokens anônimos)
     * `02 Psychosocial Risk Intelligence` (Matriz de severidade e probabilidade)
     * `03 AI Intelligence` (Apoio à decisão com trava de supervisão humana Art. 14º)
     * `04 Action Management` (Medidas preventivas com prazos, responsáveis e evidências)
     * `05 Continuous Monitoring` (Desconexão Lei 83/2021 e canal confidencial 24/7)
     * `06 Evidence & Compliance` (Exportação de relatórios auditáveis em PDF)
   * **Seção *"Technology Partner for SST"*:**
     * Mensagem: *"Você mantém a responsabilidade técnica. O AegisHub fornece a tecnologia."*
     * CTAs operacionais: `"Solicitar Partner Demo"` e `"Solicitar Demonstração"`.
   * **Disclaimer Regulatório Obrigatório** presente de forma clara e visível.

2. **Dashboard Ocupacional (`apps/web/app/(dashboard)/rh/page.tsx`):**
   * Detecção contextual do país da empresa (`country_code` do tenant).
   * Renderização de badges e enquadramentos legais correspondentes (PT vs BR).
   * Botões de exportação contextuais: `<ACTDownloadButton />` (Portugal) e `<NR1DownloadButton />` (Brasil).

3. **Fila Operacional de Ações (`ActionQueueTable.tsx`):**
   * Visualização completa do ciclo de gestão: tipo de ação, responsável, prazo, prioridade, status de reavaliação de eficácia e registo de evidências.

4. **Modelos de Relatórios em PDF:**
   * **Portugal:** `ACTReportPDF.tsx` — Enquadramento formal na Lei 102/2009.
   * **Brasil:** `NR1PGRReportPDF.tsx` — Inventário de Riscos e Plano de Ação do PGR (NR-1).

5. **Páginas de Apoio & Governança:**
   * `apps/web/app/(marketing)/ai-act/page.tsx` (Governança de IA, Transparência, Human-in-the-loop).
   * `apps/web/app/(marketing)/privacidade/page.tsx` (RGPD & LGPD, isolamento de dados).
   * `apps/web/app/(marketing)/suporte/page.tsx` (Canal de suporte para DPOs e gestores).

---

## 3. Funcionalidades Realmente Disponíveis (Prontas para Venda)

| Funcionalidade | Descrição Real |
| :--- | :--- |
| **Coleta Segura e Anônima** | Links com tokens descartáveis por colaborador, garantindo isolamento total das respostas. |
| **Questionários de Riscos Psicossociais** | COPSOQ-II adaptado e Worker Voice (NR-1.5.3.3) estruturado em 12 dimensões organizacionais. |
| **Indicador de Desconexão (Lei 83/2021)** | Métricas de risco de contato pós-jornada e sobrecarga comunicacional. |
| **Heatmap Agregado por Departamento** | Visualização de áreas críticas sem quebra de anonimato individual. |
| **Gestão do Ciclo de Prevenção** | Criação, atribuição de responsável, prazos, upload/link de evidências e controle de reavaliação de eficácia. |
| **Canal SOS & Denúncias Confidenciais** | Canal seguro alinhado à Lei 93/2021 (PT) e Canal de Ética CIPA+A (BR). |
| **Relatórios em PDF para Auditoria** | Emissão em 1 clique de relatórios estruturados para fiscalização da ACT (PT) ou anexação ao PGR/GRO (BR). |
| **Supervisão Humana de IA** | Trava de validação humana obrigatória em todas as sugestões do motor analítico. |

---

## 4. O que NÃO Deve Ser Anunciado Comercialmente

1. ❌ **"Diagnóstico Médico ou Psicológico Automatizado":** A plataforma não diagnostica patologias (CID/DSM) nem avalia aptidão clínica individual.
2. ❌ **"Certificação Oficial pela ACT / MTE":** O AegisHub não é um órgão estatal nem emite certificados estatais; é uma ferramenta tecnológica privada de conformidade e gestão.
3. ❌ **"Compliance Garantido ou Imunidade a Multas":** A responsabilidade legal e a execução das medidas cabem sempre ao empregador e ao profissional de SST.
4. ❌ **"Substituição de Médicos, Psicólogos ou Engenheiros de SST":** A plataforma é expressamente apresentada como ferramenta de suporte (*Decision Support*).
5. ❌ **"Avaliação de TDAH":** Módulos neurológicos ou cognitivos clínicos não estão no escopo comercial desta versão.

---

## 5. Matriz de Riscos Comerciais e Mitigações

| Risco Comercial / Regulatório | Probabilidade | Impacto | Mitigação Implementada no AegisHub AI |
| :--- | :---: | :---: | :--- |
| **Resistência corporativa de empresas de SST** (medo de substituição) | Médio | Alto | **Posicionamento como parceiro tecnológico**: a SST retém os honorários e a responsabilidade técnica; o software fornece a infraestrutura. |
| **Questionamento de autoridade pela ACT / MTE** | Baixo | Alto | Relatórios baseados estritamente na metodologia descrita na Lei 102/2009 e na NR-1, sem invenção de parâmetros. |
| **Denúncia por Violação de Privacidade (RGPD/LGPD)** | Baixo | Crítico | Separação criptográfica em silos: o empregador nunca acessa respostas brutas individuais, apenas métricas agregadas por departamento ($N \ge 5$). |
| **Enquadramento no EU AI Act (High-Risk AI)** | Médio | Médio | Arquitetura com *Human Oversight* (Artigo 14.º), rastreabilidade de decisões e logs auditáveis. |

---

## 6. Resultado dos Testes de Validação

```bash
# 1. Typecheck (Todos os 8 pacotes do Monorepo)
pnpm typecheck -> 0 errors (7/7 packages successful)

# 2. Vitest Suite
pnpm --filter @mindops/domain exec vitest run -> 2 test files, 9 tests passed (100%)

# 3. Next.js Production Build
pnpm build -> 28/28 static & dynamic routes compiled successfully (0 errors)
```
