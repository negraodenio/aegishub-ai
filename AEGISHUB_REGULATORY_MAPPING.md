# MAPEAMENTO REGULATÓRIO & MATRIZ DE CONFORMIDADE
## AegisHub AI — Portugal (SST/ACT) & Brasil (NR-1/GRO/PGR)

---

### 1. Marco Regulatório — Portugal (PT)

#### 1.1 Lei n.º 102/2009 — Regime Jurídico da Promoção da Segurança e Saúde no Trabalho
* **Artigo 15.º (Obrigações Gerais do Empregador):**
  * *Exigência:* Assegurar a avaliação contínua dos riscos para a segurança e saúde dos trabalhadores, incluindo os fatores psicossociais, adotando medidas de prevenção.
  * *Mapeamento AegisHub:* Coleta estruturada de dados via instrumentos psicossociais validados (COPSOQ-II), cálculo do índice composto de risco, mapa de calor por departamento e plano de medidas de prevenção.
* **Artigo 18.º (Consulta dos Trabalhadores):**
  * *Exigência:* Garantir a auscultação e participação dos trabalhadores sobre medidas que possam ter reflexos na SST.
  * *Mapeamento AegisHub:* Protocolo de participação voluntária, transparente e anônima para identificação de gargalos organizacionais.
* **Relatórios de SST (ACT / Anexo D):**
  * *Exigência:* Manutenção de documentação organizada para fiscalização da ACT e relatório anual da atividade dos serviços de SST.
  * *Mapeamento AegisHub:* Geração automática do Relatório de Avaliação de Riscos Psicossociais e extrato do Anexo D em PDF auditável.

#### 1.2 Lei n.º 93/2021 — Regime Geral de Proteção de Denunciantes de Infrações
* *Exigência:* Disponibilização de canais de denúncia interna seguros, confidenciais e que garantam a proteção contra retaliação.
* *Mapeamento AegisHub:* Canal confidencial (`/sos`) com criptografia, anonimização, triagem semântica para casos de assédio ou infrações e SLA de escalonamento prioritário para o DPO/Oficial de Integridade.

#### 1.3 Lei n.º 83/2021 — Dever de Abstenção de Contacto (Direito à Desconexão)
* *Exigência:* O empregador tem o dever de se abster de contactar o trabalhador no período de descanso, salvo situações de força maior.
* *Mapeamento AegisHub:* Indicador de Risco Organizacional de Desconexão (*Organizational Disconnect Risk*) baseado na agregação anônima de sobrecarga percebida e exigências de ritmo.

#### 1.4 RGPD (Regulamento UE 2016/679) & EU AI Act
* *Exigência:* Minimização de dados, consentimento explícito para dados de saúde (Art. 9.º RGPD) e supervisão humana obrigatória (*Human-in-the-Loop*) para sistemas de IA de alto risco (Art. 14.º EU AI Act).
* *Mapeamento AegisHub:* Silo de dados anonimizado, registro de logs de consentimento com hash de integridade, bloqueio de decisões disciplinares autônomas e fila de validação humana para qualquer indicador crítico.

---

### 2. Marco Regulatório — Brasil (BR)

#### 2.1 Norma Regulamentadora nº 01 (NR-1) — GRO e PGR
* **Item 1.5.3.2 (Identificação de Perigos e Fatores de Risco):**
  * *Exigência:* O empregador deve identificar os perigos relacionados ao trabalho, incluindo fatores ergonômicos e psicossociais relacionados à organização do trabalho.
  * *Mapeamento AegisHub:* Módulo **Worker Voice** e avaliações estruturadas para mapear exigências de ritmo, sobrecarga mental, clareza de papéis e relações interpessoais.
* **Item 1.5.3.3 (Participação dos Trabalhadores):**
  * *Exigência:* A organização deve adotar mecanismos para consultar e envolver os trabalhadores na identificação de perigos e elaboração de medidas.
  * *Mapeamento AegisHub:* Interface intuitiva de escuta do trabalhador, garantindo sigilo absoluto e consolidação puramente agregada por setor/processo.
* **Item 1.5.4 (Inventário de Riscos Ocupacionais):**
  * *Exigência:* Documentar os perigos, grupos de trabalhadores expostos, fontes geradoras, estimativa e classificação do nível de risco.
  * *Mapeamento AegisHub:* Matriz de Risco Psicossocial por Unidade $\to$ Setor $\to$ Processo/Atividade com cálculo automatizado de probabilidade/severidade.
* **Item 1.5.5 (Plano de Ação do PGR):**
  * *Exigência:* Estabelecer medidas de prevenção com cronograma, responsáveis, recursos e prazos.
  * *Mapeamento AegisHub:* Gestão completa de ações (`corrective_actions`) vinculadas aos fatores de risco identificados, com responsável e prazo definido.
* **Item 1.5.6 (Acompanhamento da Eficácia & Reavaliação):**
  * *Exigência:* Avaliar periodicamente a eficácia das medidas preventivas e reavaliar os riscos quando houver mudanças organizacionais ou novos dados.
  * *Mapeamento AegisHub:* Ciclo contínuo de reavaliação de eficácia e registro de evidências de execução das ações.

#### 2.2 Lei nº 14.457/2022 — Programa Emprega + Mulher (CIPA+A)
* *Exigência:* Fixação de procedimentos para recebimento e acompanhamento de denúncias de assédio e violência no ambiente de trabalho.
* *Mapeamento AegisHub:* Integração com o canal de ética/denúncias com garantia de anonimato e registro auditável.

#### 2.3 LGPD (Lei nº 13.709/2018)
* *Exigência:* Tratamento adequado de dados pessoais sensíveis com finalidade legítima e garantia de sigilo em relação à gestão de RH.
* *Mapeamento AegisHub:* Proibição arquitetural de relatórios individuais de saúde mental para o RH. Todos os dashboards corporativos apresentam apenas métricas organizacionais agregadas (mínimo de agregação por grupo para evitar reidentificação).

---

### 3. Matriz de Linguagem Segura & Posicionamento Comercial

Para garantir proteção jurídica e credibilidade perante clientes corporativos e empresas de SST:

| Expressão Proibida / Inadequada ❌ | Expressão Recomendada e Segura ✅ | Justificativa Regulatória |
| :--- | :--- | :--- |
| "Diagnóstico médico / psicológico" | "Indicador de Risco Psicossocial" / "Sinal de Alerta" | O software não é dispositivo médico e não diagnostica patologias. |
| "Detecção de Depressão / Ansiedade" | "Mapeamento de Fatores de Sobrecarga Mental" | Foco nas condições de trabalho e organização, não no indivíduo. |
| "Garante 100% de conformidade legal" | "Apoia e documenta evidências para conformidade" | A conformidade legal é responsabilidade técnica e jurídica da empresa. |
| "Substitui médico do trabalho / perito" | "Potencializa a capacidade técnica do especialista" | O AegisHub é uma ferramenta de suporte à decisão profissional. |
| "Indícios sub-clínicos de colaboradores" | "Métricas organizacionais de exposição a fatores de risco" | Evita rotulação clínica do trabalhador perante a organização. |
| "Auditar meu risco de multa" | "Avaliar a prontidão de gestão de SST da organização" | Posicionamento proativo e preventivo, não punitivo. |
| "Decisão automatizada de afastamento" | "Sugestão assistiva sujeita à validação profissional" | Cumpre exigência de supervisão humana (EU AI Act e Ética SST). |

---
*Mapeamento Regulatório homologado para orientar o desenvolvimento e a comunicação comercial.*
