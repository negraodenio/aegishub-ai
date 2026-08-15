# PLANO DE IMPLEMENTAÇÃO INCREMENTAL & ARQUITETURA DE EXECUÇÃO
## AegisHub AI — Expansão Comercial Portugal (PT) e Brasil (BR)

---

### 1. Diretriz Arquitetural Fundamental

```
EXTEND  >  REUSE  >  REFACTOR  >  CREATE
```
* **Não duplicar aplicações:** Uma única aplicação Next.js (`apps/web`).
* **Não duplicar banco de dados:** Um único schema PostgreSQL/Supabase com perfil por tenant.
* **Não duplicar motores de cálculo:** Um único motor de composição e avaliação em `@mindops/domain`.
* **Configurabilidade dinâmica:** O comportamento regional é determinado pelo `CountryProfile` do tenant (`countryCode = 'PT' | 'BR'`).

---

### 2. Roadmap de Execução Incremental

#### Etapa 1: Motor de Perfis Jurisdicionais (`CountryProfile`)
* **Localização:** `packages/domain/src/jurisdiction/`
* **Implementação:**
  * Interface `CountryProfile`: `countryCode`, `name`, `language`, `timezone`, `currency`, `legalFramework`, `terminology`, `modules`, `privacyProfile`.
  * Definição de `PORTUGAL_PROFILE` (`PT`) e `BRAZIL_PROFILE` (`BR`).
  * Função helper de resolução: `getCountryProfile(countryCode: string): CountryProfile`.
* **Sem quebras:** Caso não especificado, o fallback padrão mantém o comportamento atual de Portugal.

#### Etapa 2: Extensão do Ciclo de Risco Unificado (Core SST)
* **Localização:** `packages/database`, `packages/domain/src/assessment/`
* **Implementação:**
  * Atualização da tabela `corrective_actions` (via migração SQL segura com `ADD COLUMN IF NOT EXISTS`) para suportar:
    * `responsible_name` (Texto)
    * `hazard_factor` (Texto / Dimensão)
    * `process_activity` (Texto / Processo ou Atividade)
    * `evidence_url` (Texto / Link de documento)
    * `evidence_notes` (Texto / Descrição da evidência)
    * `effectiveness_score` (Numérico / 0 a 100)
    * `reassessment_date` (Data prevista)
    * `reassessment_status` (Texto / `pending`, `satisfactory`, `remedial_required`)
  * Fechamento do ciclo: **Assess $\to$ Identify $\to$ Analyze $\to$ Intervene $\to$ Monitor $\to$ Reassess $\to$ Evidence**.

#### Etapa 3: Módulo Worker Voice (Brasil / NR-1.5.3.3)
* **Localização:** `packages/domain/src/assessment/instruments/worker-voice.ts`
* **Implementação:**
  * Instrumento com foco na organização do trabalho (Carga de trabalho, Clareza de papéis, Autonomia, Suporte da liderança, Relações interpessoais, Recursos de trabalho).
  * Sem patologização do trabalhador; foco exclusivo na percepção do ambiente laboral.
  * Integração ao `score-composer.ts` e ao fluxo de submissão.

#### Etapa 4: Indicador de Risco de Desconexão (Portugal / Lei 83/2021)
* **Localização:** `packages/domain/src/assessment/indicators/disconnect-risk.ts`
* **Implementação:**
  * Cálculo agregado de `Organizational Disconnect Risk` combinando fatores de ritmo de trabalho, exigências quantitativas e reporte de disponibilidade pós-jornada.
  * 100% agregado por unidade/departamento, sem monitoramento de conteúdo privado.

#### Etapa 5: Adaptação de Relatórios Regulatórios em PDF
* **Localização:** `apps/web/features/compliance/` e `apps/web/lib/reports/`
* **Implementação:**
  * **Portugal:** Refinamento do `ACTReportPDF.tsx` e `AnexoDReportPDF.tsx` com linguagem rigorosamente alinhada à Lei 102/2009 e Lei 93/2021.
  * **Brasil:** Criação do gerador `NR1PGRReportPDF.tsx` contendo o **Inventário de Riscos Ocupacionais** e o **Plano de Ação do PGR**.

#### Etapa 6: Dashboards Adaptativos (PT / BR)
* **Localização:** `apps/web/app/(dashboard)/rh/` e `features/rh-dashboard/`
* **Implementação:**
  * Ajuste de cards e cabeçalhos para exibir terminologia correspondente ao perfil do tenant (ex: NIPC vs CNPJ, Unidade/Dept vs Setor/Processo, Lei 102/2009 vs NR-1/PGR).
  * Exibição de indicadores agregados com foco organizacional, preservando a intimidade individual.

#### Etapa 7: Reposicionamento da Landing Page & Seção de Parceiros
* **Localização:** `apps/web/app/(marketing)/page.tsx`
* **Implementação:**
  * Novo posicionamento comercial: **"AI-Powered Workplace Intelligence — Inteligência para Riscos Psicossociais no Trabalho"**.
  * Seletor de país no topo da página: 🇵🇹 **Portugal** / 🇧🇷 **Brasil**.
  * Apresentação estruturada dos **6 Pilares Comerciais** (Assessment, Risk Intelligence, AI Intelligence, Action Management, Continuous Monitoring, Evidence & Compliance).
  * Seção dedicada: **"Technology Partner for SST"** com CTA para empresas e operadores de SST se tornarem parceiros tecnológicos.
  * Higienização completa de claims clínicos ou absolutistas.

#### Etapa 8: Suíte de Testes Automatizados
* **Localização:** `packages/domain/src/__tests__/` e `apps/web/__tests__/`
* **Implementação:**
  * Testes de carga do `CountryProfile` (PT e BR).
  * Testes de cálculo de score do `WorkerVoice` e `COPSOQ-II`.
  * Testes do ciclo de Ações Corretivas com Evidências e Reavaliação.
  * Testes de isolamento de tenants e conformidade com guardrails éticos.

---
*Plano de Implementação pronto para execução sob aprovação.*
