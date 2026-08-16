# P6 DATA PROTECTION IMPACT ASSESSMENT (DPIA) DISCOVERY
**Documento:** `P6_DPIA_DISCOVERY.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Data Protection & AI Compliance Architect  
**Aviso Legal:** Este documento constitui uma análise técnica de engenharia de privacidade (*Privacy-by-Design*) e não substitui parecer jurídico formal emitido por advogado ou DPO estatutário.

---

## 1. ESCOPO DO TRATAMENTO DE DADOS

O AegisHub AI realiza 3 fluxos fundamentais de tratamento de dados:
1. **Avaliação Agregada de Riscos Psicossociais Ocupacionais (SST):** Coleta de percepções dos trabalhadores sobre fatores ergonômicos e psicossociais para emissão de relatórios regulatórios perante a ACT (Portugal) e MTE (Brasil).
2. **Sistema de Governança de Decisões de IA (EU AI Act):** Geração assistida de recomendações preventivas de SST com supervisão humana obrigatória (*Human-in-the-loop*).
3. **Módulo de Apoio Executivo & Suporte Cognitivo (Benefício B2B):** Ferramenta voluntária para organização de foco e quebra de tarefas pessoais.

---

## 2. MATRIZ DE RISCOS DE PRIVACIDADE E CONTROLES TÉCNICOS

| ID do Risco | Descrição do Risco | Titulares Impactados | Gravidade Inicial | Probabilidade | Controles Técnicos Implementados | Risco Residual |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **DPIA-01** | **Reidentificação de Colaborador em Pequenos Grupos:** Inferência de respostas individuais em departamentos com poucas pessoas. | Colaboradores | **Alto** | Média | **Limiar de Anonimização ($N \ge 5$):** Bloqueio algorítmico e mascaramento com `"DADOS INSUFICIENTES"` para setores com menos de 5 avaliados. | **Baixo** |
| **DPIA-02** | **Acesso Não Autorizado pelo Empregador aos Dados Cognitivos:** Utilização do benefício para mapear ou discriminar colaboradores neurodivergentes. | Colaboradores | **Crítico** | Baixa | **RLS Estrito `auth.uid() = user_id`:** RH/Gestores possuem zero acesso a perfis e tarefas cognitivas. Métricas agregadas B2B exigem $N \ge 20$. | **Mínimo** |
| **DPIA-03** | **Vazamento de Prontuário Médico para o RH:** Confusão entre dados ergonômicos de SST e notas clínicas confidenciais. | Pacientes / Colaboradores | **Crítico** | Baixa | **Segregação de Rotas e Schemas:** Prontuário confinado à rota `/clinical` com autorização restrita a profissionais de saúde. | **Mínimo** |
| **DPIA-04** | **Decisão de IA Discriminatória sem Revisão:** Implementação de medidas restritivas automáticas geradas por IA. | Colaboradores | **Alto** | Baixa | **EU AI Act Human-in-the-loop:** IA apenas sugere medidas ergonômicas; aprovação humana obrigatória registrada em `ai_audit_logs`. | **Baixo** |
| **DPIA-05** | **Exposição de Dados Sensíveis em Logs de Auditoria:** Gravação de prompts ou tarefas pessoais em arquivos de telemetria. | Colaboradores | **Médio** | Média | **Auditoria por Hash Criptográfico SHA-256:** Gravação exclusiva de hashes de prompt e resposta sem retenção de texto puro. | **Mínimo** |

---

## 3. AVALIAÇÃO DE NECESSIDADE E PROPORCIONALIDADE

1. **Minimização de Dados:** O sistema não coleta endereço residencial, dados bancários, CID-10 nem informações familiares dos trabalhadores.
2. **Exatidão e Integridade:** Os relatórios de conformidade utilizam assinatura criptográfica SHA-256 e controle de versionamento imutável.
3. **Limitação de Finalidade:** Dados coletados para fins de benefício cognitivo não são reutilizados para avaliação de desempenho profissional nem para fins disciplinares.
