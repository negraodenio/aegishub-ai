# AEGISHUB AI — LANDING PAGE CONVERSION & POSITIONING AUDIT
## Comprehensive B2B SaaS CRO, Positioning, UX & Multi-Jurisdiction Audit (PT-PT & PT-BR)

**Data:** 17 de Agosto de 2026  
**Auditores:** Principal Product Marketing Strategist, Enterprise B2B CRO Expert, UX/UI Architect, Privacy Engineer & Senior Copywriter (PT/BR)  
**Princípio de Auditoria:** *Zero-Hype. Zero-Fabrication. Show, Don't Tell. Maximum Commercial Conversion.*

---

## 1. Executive Summary

A auditoria à Landing Page atual (`apps/web/app/(marketing)/page.tsx`) revela um produto com **infraestrutura técnica e regulatória de classe mundial (P1 a P5.3)**, mas cuja **apresentação comercial está aquém do seu valor real**:

1. **Invisibilidade do Produto:** O utilizador não vê as interfaces reais construídas (o *Unstuck Chat* com Gemini 3 Flash, o *Focus Timer*, o *Action Center V2*, a *Ergonomia Vocal P5.3*, o *Heatmap de Riscos*). O produto parece um "portal institucional estático" em vez de uma plataforma de IA moderna e interativa.
2. **Confusão de Categoria:** A página oscila entre "software de consultoria SST" e "painel de conformidade burocrática", esquecendo de demonstrar o motor de **Workplace Cognitive AI** e apoio diário ao colaborador.
3. **Ausência da Jornada do Colaborador (User vs. Buyer):** O comprador (RH/SST/CEO) quer saber o ROI e a conformidade; o colaborador quer saber *"isto vai vigiar-me ou vai ajudar-me?"*. A página não responde com clareza a este medo central de vigilância.
4. **Falta de Demonstrações Interativas e Narrativas "Show, Don't Tell":** Faltam fluxos visuais do tipo: *Bloqueio na Tarefa ➔ Unstuck Chat ➔ Micro-Ação < 2 min ➔ Foco 300s ➔ Sucesso*.

---

## 2. Score Geral de Conversão

| Dimensão | Peso | Score Atual | Target Recomendado | Diagnóstico Crítico |
| :--- | :---: | :---: | :---: | :--- |
| **Clarity (O que é nos primeiros 5s)** | 20 | **11 / 20** | **19 / 20** | Hero foca em conceito genérico de SST e esconde o motor de IA cognitiva. |
| **Value Proposition (Proposta de Valor)** | 15 | **9 / 15** | **14 / 15** | Faltam métricas de ROI, impacto em sobrecarga mental e fricção operacional. |
| **Product Demonstration (Visibilidade UI)** | 15 | **4 / 15** | **15 / 15** | **Ponto Mais Fraco:** Zero screenshots reais das ferramentas ativas. |
| **Trust & Evidence (Credibilidade)** | 10 | **7 / 10** | **9 / 10** | Boa citação de leis, mas faltam metodologias científicas visíveis (COPSOQ-II). |
| **Privacy by Design (Anti-Vigilância)** | 10 | **6 / 10** | **10 / 10** | Não destaca o limiar $N \ge 5$ e a separação estrita colaborador vs. RH. |
| **Differentiation (vs. Wellness Apps)** | 10 | **5 / 10** | **9 / 10** | Risco de ser confundido com app de meditação ou chatbot genérico. |
| **Call to Action (CTAs & Funil)** | 10 | **6 / 10** | **9 / 10** | Apenas 1 modal genérico; falta opção de teste interativo ou tour guiado. |
| **Social Proof / Parcerias** | 5 | **2 / 5** | **4 / 5** | Sem programa estruturado de *Design Partners* ou estatísticas do setor. |
| **Localization (PT-PT / PT-BR)** | 5 | **3 / 5** | **5 / 5** | O switch altera apenas 3 badges, sem adaptar a copy integralmente. |
| **TOTAL** | **100** | **53 / 100** | **94 / 100** | **Classificação Atual: 🟡 MÉDIA (Perda de Leads B2B)** |

---

## 3. Teste dos 5 Segundos (Hero Section)

Ao abrir o topo da página durante 5 segundos, um executivo de RH ou CEO responde:
1. **O que é?** *"Algum sistema sobre riscos psicossociais e SST."* (Impreciso)
2. **Para quem é?** *"Empresas de SST e RH."* (Razoável)
3. **Qual problema resolve?** *"Cumprimento de regras legais e relatórios."* (Visão redutora)
4. **Por que é diferente de um formulário Google ou app de RH?** *"Não fica claro."* (Falha grave)
5. **O que devo fazer agora?** *"Clicar em solicitar demo."* (Aceitável)

**Nota do Teste dos 5 Segundos:** **5.5 / 10** (Necessita de reescrita focada em impacto e demonstração visual).

---

## 4. Auditoria de Objeções por Persona

```
                               ┌─────────────────────────┐
                               │   VISITANTE NA PÁGINA   │
                               └────────────┬────────────┘
                                            │
                ┌───────────────────────────┼───────────────────────────┐
                ▼                           ▼                           ▼
       ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
       │     DIRETOR     │         │     DIRETOR     │         │  COLABORADOR /  │
       │    DE RH/CEO    │         │     SST / DPO   │         │    UTILIZADOR   │
       └────────┬────────┘         └────────┬────────┘         └────────┬────────┘
                │                           │                           │
   "Qual o ROI real e por      "Como garanto a conformi-   "Meu chefe vai ver
   que não é só mais um        dade técnica sem violar o   as minhas respostas ou
   wellness app descartável?"  RGPD/LGPD com IA?"          o que eu falo no chat?"
                │                           │                           │
                ▼                           ▼                           ▼
       ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
       │ RESPOSTA FALTA: │         │ RESPOSTA FALTA: │         │ RESPOSTA FALTA: │
       │ Redução de turnover,      │ Metodologia COPSOQ II,    │ Limiar N >= 5, chat      │
       │ menos fricção diária,     │ trava N >= 5, supervisão  │ session-only e zero     │
       │ evidência documental      │ humana obrigatória        │ playback de áudio ao RH │
       └─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 5. Hero Section: 5 Propostas Estratégicas

### Opção A — Foco no CEO / ROI Estratégico
* **Headline:** *"Elimine a Fricção Ocupacional e Proteja a Produtividade da Sua Organização."*
* **Subheadline:** *"A primeira plataforma de Workplace Cognitive AI que combina suporte individual ao foco com inteligência preditiva de riscos psicossociais para a liderança."*
* **CTA Principal:** `Solicitar Demonstração Executiva` | **Secundário:** `Ver Calculadora de Impacto`

### Opção B — Foco no Diretor de RH / People & Culture *(Altamente Recomendada)*
* **Headline:** *"Inteligência Cognitiva no Trabalho. Prevenção Real de Riscos Psicossociais."*
* **Subheadline:** *"Dê suporte executivo imediato aos colaboradores para destravar tarefas e obtenha mapas de calor organizacionais 100% anónimos para orientar planos de ação eficazes."*
* **CTA Principal:** `Agendar Demonstração para RH` | **Secundário:** `Explorar as Ferramentas de IA`

### Opção C — Foco em SST / Medicina do Trabalho / Parceiros
* **Headline:** *"A Infraestrutura Tecnológica de IA para Empresas e Consultorias de SST."*
* **Subheadline:** *"Automatize avaliações psicossociais COPSOQ-II, ergonomia vocal e gere relatórios auditáveis para a ACT (Lei 102/2009) e MTE (NR-1/PGR) com total rigor técnico."*
* **CTA Principal:** `Seja um Parceiro SST Homologado` | **Secundário:** `Ver Modelo de Relatório PDF`

### Opção D — Human-Centered / Foco no Colaborador
* **Headline:** *"Menos Paralisia no Trabalho. Mais Clareza, Foco e Bem-Estar."*
* **Subheadline:** *"Um assistente diário que desmembra tarefas complexas em micro-ações de 2 minutos, com privacidade absoluta e sem qualquer vigilância individual da chefia."*
* **CTA Principal:** `Experimentar o Unstuck Chat` | **Secundário:** `Conhecer a Nossa Política de Privacidade`

### Opção E — Enterprise / Compliance & DPO
* **Headline:** *"Gestão de Riscos Psicossociais com Governança de IA e Privacidade por Padrão."*
* **Subheadline:** *"Conformidade técnica contínua com a NR-1, Lei 102/2009 e EU AI Act. Dados isolados por tenant, anonimato algorítmico ($N \ge 5$) e rastreabilidade total de evidências."*
* **CTA Principal:** `Solicitar Dossiê Técnico e Demo` | **Secundário:** `Consultar Arquitetura de Segurança`

---

## 6. Histórias Visuais "Show, Don't Tell" para a Landing Page

### História 1: O Colaborador Travado (Unstuck Engine em Ação)
```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│   PROBLEMA REAL        │      │   INTERVENÇÃO DA IA    │      │   AÇÃO IMEDIATA        │
│ "Tenho 20 itens no     │ ───► │ "Esqueça os 20 itens.  │ ───► │ Next Action:           │
│ relatório e não sei    │      │ Vamos escolher apenas  │      │ 'Abrir o ficheiro e    │
│ por onde começar."     │      │ 1 para os próximos 5m."│      │ digitar o sumário'     │
└────────────────────────┘      └────────────────────────┘      │ Timer: [ 05:00 ] INICIAR│
                                                                └────────────────────────┘
```

### História 2: O Diretor de RH / SST (Mapa de Calor Seguro)
```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│   COLETA ANÓNIMA       │      │   MAPA DE CALOR        │      │   PLANO NO ACTION CTR  │
│ Respostas com tokens   │ ───► │ Setor Operações: 68/100│ ───► │ Ação Preventiva #04:   │
│ descartáveis via link  │      │ Limiar N >= 5 Ativo    │      │ 'Revisão de pausas e   │
│ sem login invasivo     │      │ (Zero dados isolados)  │      │ cadência de entregas'  │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

### História 3: A Ergonomia Vocal (Prevenção sem Vigilância Emocional)
```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│   GRAVAÇÃO DE 15 SEG   │      │   ANÁLISE ACÚSTICA DSP │      │   FEEDBACK ERGONÓMICO  │
│ Leitura de texto neutro│ ───► │ F0, Jitter, Shimmer e  │ ───► │ "Esforço vocal elevado.│
│ no início da jornada   │      │ Pausas calculados      │      │ Sugestão: Pausa ativa  │
│                        │      │ (Sem inferir emoções)  │      │ e hidratação."         │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

---

## 7. Diferenciação: AegisHub AI vs. Concorrentes

| Critério | Apps Genéricos de Meditação / Bem-Estar | Formulários e Consultorias Tradicionais | **AEGISHUB AI (Workplace Cognitive AI)** |
| :--- | :--- | :--- | :--- |
| **Abordagem** | Reativa / Passiva (Áudios de respiração) | Burocrática (PDF estático 1x ao ano) | **Ativa & Operacional no fluxo de trabalho** |
| **Apoio ao Trabalho**| Não ajuda a executar tarefas | Apenas aponta o problema | **Unstuck Chat desmembra tarefas em micro-ações** |
| **Frequência** | Quando o funcionário lembra de abrir | Anual ou semestral | **Acompanhamento contínuo e preventivo** |
| **Privacidade** | Coleta dados pessoais e de humor | Risco de vazamento em planilhas | **Criptografia, RLS, $N \ge 5$ e Anti-Vigilância** |
| **Conformidade** | Nenhuma evidência legal | Relatórios manuais lentos | **Geração instantânea para NR-1 e Lei 102/2009** |
| **Ergonomia Vocal** | Não possui | Inexistente ou requer fonoaudiólogo | **Análise acústica DSP objetiva (P5.3)** |

---

## 8. Tabela Comparativa de Localização: PT-PT vs. PT-BR

| Elemento | Versão Portugal (PT-PT) | Versão Brasil (PT-BR) |
| :--- | :--- | :--- |
| **Enquadramento Legal**| Lei n.º 102/2009, ACT, RGPD, Lei 93/2021 | NR-1 (GRO/PGR), NR-17, LGPD, Lei 14.457 (CIPA+A) |
| **Terminologia de Pessoas**| Colaborador / Trabalhador / Equipa | Colaborador / Equipe / Funcionário |
| **Terminologia de Gestão**| Riscos Psicossociais / Medicina do Trabalho | Fatores de Riscos Psicossociais / SESMT / CIPA |
| **Headline Proposta** | *"Inteligência Ocupacional e Apoio Cognitivo para a sua Organização."* | *"Inteligência para Riscos Psicossociais e Suporte Cognitivo no Trabalho."* |
| **Subheadline Proposta**| *"Apoie os trabalhadores na sobrecarga diária e automatize o cumprimento da Lei 102/2009 com relatórios para a ACT."* | *"Destrave a produtividade diária da equipe e automatize o inventário e plano de ação do PGR (NR-1)."* |
| **CTA Principal** | `Agendar Demonstração` | `Solicitar Demonstração` |
| **CTA Secundário** | `Programa de Parceiros SST` | `Programa de Parceiros e Clínicas SST` |

---

## 9. Top 5 Problemas Críticos Atuais (P0/P1)

1. **P0 (Conversão): Falta de Screenshots e Demonstração do Unstuck Chat.**
   * *Problema:* O visitante não vê a interface do produto, gerando dúvida se a solução já existe ou é apenas um conceito.
   * *Correção:* Inserir um mockup interativo ou screenshot de alta fidelidade do Unstuck Chat e do Focus Timer logo abaixo do Hero.
2. **P0 (Confiança): Falta de Explicação Clara sobre o Limiar de Anonimato ($N \ge 5$).**
   * *Problema:* Colaboradores e DPOs temem que o RH use a IA para punir indivíduos.
   * *Correção:* Criar o selo e seção destacada *"Privacidade Garantida por Algoritmo: Nenhum gestor tem acesso a dados de setores com menos de 5 pessoas"*.
3. **P1 (Posicionamento): Excesso de Jargão Burocrático no Hero.**
   * *Problema:* O texto atual abre focado exclusivamente em "riscos psicossociais" e ignora o ganho de produtividade executiva e clareza mental do colaborador.
   * *Correção:* Equilibrar a mensagem entre **Apoio Cognitivo ao Colaborador** + **Gestão Estratégica para o RH/SST**.
4. **P1 (Localização): O Switcher de País Altera Apenas 3 Badges.**
   * *Problema:* O restante do texto permanece misturado.
   * *Correção:* Tornar todo o conteúdo dinâmico com base no estado `country === "PT" ? copyPT : copyBR`.
5. **P2 (Prova Social): Falta do Convite ao "Programa de Parceiros de Design / Piloto Homologado".**
   * *Problema:* Como o produto é inovador, os clientes procuram casos de sucesso.
   * *Correção:* Oferecer a chamada *"Participe do Programa Piloto Empresarial 2026: Vagas limitadas para co-desenvolvimento e homologação SST"*.

---

## 10. Arquitetura de Informação Recomendada para a Nova Landing Page

```
01. TOP NAVIGATION      ➔ Logo, País (PT/BR), Pilares, Soluções, Privacidade, "Ver Dashboard", "Entrar"
02. HERO COM PRODUCT UI ➔ Headline de Alto Impacto, Subheadline, CTAs Primário/Secundário, Mockup Interativo
03. SOCIAL PROOF / PILOT➔ "Empresas e Consultorias SST Inovadoras estão a aderir ao Piloto 2026"
04. O PROBLEMA MODERNO  ➔ A Sobrecarga Cognitiva, Paralisia de Tarefas e Riscos Psicossociais no Trabalho
05. A SOLUÇÃO (4 PILARES)➔ DETECT (Assessments) ➔ PREVENT (Ações) ➔ SUPPORT (Unstuck AI) ➔ IMPROVE (Insights)
06. DEMO INTERATIVA     ➔ Unstuck Chat em Ação (Problema ➔ IA ➔ Micro-Ação ➔ Timer de Foco)
07. ACTION CENTER V2    ➔ Gestão do Ciclo de Prevenção com Evidências Auditáveis (PDF para ACT / MTE)
08. ERGONOMIA VOCAL     ➔ Análise Acústica Objetiva (Sem julgamento emocional ou invasão)
09. PRIVACIDADE POR DESIGN➔ Trava N >= 5, Session-Only Chat, Zero Vigilância, RLS e Criptografia
10. CALCULADORA DE ROI  ➔ Estimativa de redução de atrito e horas recuperadas de foco
11. QUEM SE BENEFICIA   ➔ Diretores de RH, Técnicos/Médicos de SST, CEOs e Colaboradores
12. PROGRAMA PARCEIROS  ➔ Modelo comercial dedicado para clínicas de SST e consultorias
13. FAQ ESTRATÉGICO     ➔ Respostas diretas para Jurídico, DPO, RH e Colaboradores
14. CTA FINAL           ➔ "Pronto para transformar a gestão cognitiva e psicossocial da sua empresa?"
15. FOOTER & COMPLIANCE ➔ Links de Privacidade (RGPD/LGPD), AI Act, Suporte e Disclaimer Legal
```

---

## 11. Conclusão & Próximos Passos

O **AegisHub AI** tem uma base tecnológica extremamente robusta e testada a 100%. Com a reestruturação da Landing Page para **mostrar o produto real**, **destacar o Unstuck Chat** e **tranquilizar os colaboradores quanto à privacidade**, a taxa de conversão de leads qualificados (RHs, CEOs e Clínicas de SST) aumentará substancialmente.

*Aguardando aprovação para implementar os novos componentes visuais e cópias revisadas na página principal.*
