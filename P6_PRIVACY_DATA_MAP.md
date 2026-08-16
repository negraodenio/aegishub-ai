# P6 PRIVACY DATA MAP & RGPD / LGPD COMPLIANCE
**Documento:** `P6_PRIVACY_DATA_MAP.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Data Protection & Privacy Architect

---

## 1. MATRIZ DE RETENÇÃO DE DADOS POR TABELA

| Tabela | Categoria de Dados | Base Legal | Retenção Atual | Retenção Recomendada | Justificativa Regulatória / Risco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `compliance_reports` | Agregados de Conformidade | Lei 102/2009 / NR-1 | Permanente | 10 anos (PT) / 20 anos (BR) | Obrigação legal de guarda de relatórios de SST para fiscalização do trabalho. |
| `report_audit_logs` | Auditoria de Relatórios | RGPD Art. 5º / LGPD Art. 6º | Permanente | 5 anos | Rastreabilidade de emissão e auditoria técnica. |
| `action_evidence` | Evidências SST / Fotos / PDFs | Lei 102/2009 / NR-1 | Permanente | 5 anos pós-conclusão | Comprovação de cumprimento de medidas preventivas perante a ACT/MTE. |
| `assessment_sessions` | Sessões de Avaliação Ocupacional | Medicina do Trabalho | Permanente | 10 anos | Histórico ocupacional confidencial do serviço de SST. |
| `cognitive_user_profiles` | Consentimento e Preferências | Consentimento (Art. 9º/11º) | Até revogação | Até revogação ou término do contrato | Dados do benefício voluntário; exclusão sob demanda do titular. |
| `cognitive_tasks` | Tarefas Pessoais / Metas | Execução do Benefício | Permanente | 12 meses pós-inatividade | Minimização de dados; expiração automática de tarefas antigas. |
| `llm_usage_leases` | Logs de Quota e Tokens | Legítimo Interesse | Diário | 90 dias | Auditoria de custos e prevenção de abusos; expurgo periódico. |
| `ai_audit_logs` | Auditoria de IA / Validação Humana | EU AI Act (Art. 12) | Permanente | 10 anos | Registro obrigatório de supervisão humana e rastreabilidade de decisões. |

---

## 2. MATRIZ DE ACESSO: PAPEL × CATEGORIA DE DADOS (`ROLE × DATA CATEGORY × ACCESS`)

| Categoria de Dados | Colaborador (`employee`) | RH (`rh`) | Gestor de Linha (`manager`) | SST / Médico (`sst_professional`) | Admin (`admin`) | DPO / Auditor (`dpo`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Metas e Tarefas Cognitivas** (`cognitive_tasks`) | ✅ Total (Próprio) | ❌ Zero Acesso | ❌ Zero Acesso | ❌ Zero Acesso | ❌ Zero Acesso | ❌ Zero Acesso |
| **Consentimento Cognitivo** (`cognitive_user_profiles`) | ✅ Total (Próprio) | ❌ Zero Acesso | ❌ Zero Acesso | ❌ Zero Acesso | ❌ Zero Acesso | 👁️ Apenas Metadado de Auditoria |
| **Prontuário Médico Confidencial** (`/clinical`) | 👁️ Visualização Própria | ❌ Zero Acesso | ❌ Zero Acesso | ✅ Total (Com Sigilo) | ❌ Zero Acesso | ❌ Zero Acesso |
| **Indicadores Agregados de Setor** ($N \ge 5$) | ❌ Zero Acesso | 👁️ Visualização | 👁️ Visualização | 👁️ Visualização | 👁️ Visualização | 👁️ Visualização |
| **Relatórios Estatutários de SST** | ❌ Zero Acesso | 👁️ Visualização / Download | ❌ Zero Acesso | ✅ Geração e Assinatura | 👁️ Visualização | ✅ Auditoria de Compliance |
| **Evidências de Medidas Preventivas** | ❌ Zero Acesso | 👁️ Visualização | 👁️ Visualização | ✅ Upload e Validação | 👁️ Visualização | 👁️ Auditoria |
| **Auditoria de IA e Supervisão Humana** | ❌ Zero Acesso | ❌ Zero Acesso | ❌ Zero Acesso | ✅ Validação de Recomendações | 👁️ Visualização | ✅ Auditoria Completa |

---

## 3. ESPECIFICAÇÃO DE APIS DE DIREITOS DO TITULAR (DATA PRIVACY ENDPOINTS)

### A. Direito ao Esquecimento (`DELETE /api/privacy/me`)
- **Regra de Negócio:**
  1. Apaga imediatamente: `cognitive_tasks`, `cognitive_user_profiles`, `llm_usage_leases` e preferências do utilizador autenticado.
  2. Anonimiza sessões históricas desvinculando `employee_id` caso a avaliação componha relatórios agregados fechados de SST.
  3. **Preserva:** Relatórios estatutários gerados (`compliance_reports`) com fundamento na obrigação legal do empregador (Art. 17º(3)(b) do RGPD e Art. 16º(I) da LGPD).

### B. Direito de Portabilidade e Exportação (`GET /api/privacy/export`)
- Gera arquivo JSON cifrado contendo:
  - Dados cadastrais do perfil (`profiles`).
  - Tarefas e reflexões de apoio executivo (`cognitive_tasks`).
  - Histórico de consentimentos outorgados e revogados.
  - **Isolamento Absoluto:** Zero inclusão de dados de outros colaboradores ou métricas organizacionais sigilosas.
