# P6 ENTERPRISE ONBOARDING LIFECYCLE
**Documento:** `P6_ONBOARDING_GAP.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Solutions Architect

---

## 1. JORNADA COMPLETA DO CLIENTE ENTERPRISE

```
[1. PROVISION TENANT] ────> Criação da organização (Nome, NIF/CNPJ, CAE/CNAE)
         ↓
[2. SET JURISDICTION] ────> Definição da jurisdição (PT: Lei 102/2009 / BR: NR-1 / GRO)
         ↓
[3. RBAC PROVISIONING] ───> Criação de Administrador, RH, Médico/SST e DPO
         ↓
[4. EMPLOYEE ROSTER] ─────> Importação de departamentos e colaboradores
         ↓
[5. ACTIVATE MODULES] ────> Habilitação opcional do Benefício de Suporte Cognitivo
         ↓
[6. LAUNCH CAMPAIGN] ─────> Criação de Campanha Anual com código seguro (AEG-2026-XXXXXX)
         ↓
[7. RUN ASSESSMENTS] ─────> Coleta anônima com limiar estrito (N ≥ 5)
         ↓
[8. SST INTERVENTIONS] ───> Geração e aprovação humana de medidas preventivas
         ↓
[9. EVIDENCE UPLOAD] ─────> Upload e auditoria de comprovação de execução
         ↓
[10. COMPLIANCE REPORT] ──> Emissão de Relatório Estatutário com Hash SHA-256
```

---

## 2. GAPS IDENTIFICADOS & ESPECIFICAÇÃO DE MELHORIAS

1. **Importação em Lote de Colaboradores (CSV/Excel Roster Upload):**
   - *Estado Atual:* Onboarding individual via formulário em `/admin/team`.
   - *Recomendação P6:* Adicionar parser de CSV com validação prévia de duplicidade de NIF/CPF e vínculo de departamento.
2. **Onboarding Wizard Guiado para o Primeiro Acesso do Admin:**
   - *Recomendação P6:* Modal interativo de boas-vindas guiando o Admin nas 3 etapas essenciais (Confirmar Jurisdição -> Importar Equipe -> Criar 1ª Campanha).
