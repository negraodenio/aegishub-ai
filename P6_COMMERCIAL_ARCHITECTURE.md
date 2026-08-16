# P6 COMMERCIAL ARCHITECTURE & SUBSCRIPTION TIERS
**Documento:** `P6_COMMERCIAL_ARCHITECTURE.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Commercial & SaaS Architect

---

## 1. MATRIZ DE PLANOS COMERCIAIS & GATING DE FUNCIONALIDADES

| Funcionalidade / Recurso | Starter (PME) | Professional (Médio Porte) | Enterprise (Corporativo) |
| :--- | :---: | :---: | :---: |
| **Limite de Colaboradores (Seats)** | Até 50 colaboradores | Até 250 colaboradores | Ilimitado / Customizado |
| **Campanhas Simultâneas** | 1 campanha ativa | Até 5 campanhas | Campanhas ilimitadas |
| **Jurisdições Habilitadas** | 1 (PT ou BR) | 1 (PT ou BR) | Multi-Jurisdição (PT + BR) |
| **Relatórios Estatutários SHA-256** | 2 relatórios / ano | Ilimitados | Ilimitados + Exportação Auditável |
| **Motor de Evidências SST** | Básico (Até 500 MB) | Avançado (Até 5 GB) | Ilimitado com Backup Frio |
| **Módulo de Suporte Cognitivo** | ❌ Não incluído (Add-on) | ✅ Incluído (Até 50 licenças) | ✅ Incluído (Licenças Flexíveis) |
| **Governança de IA (EU AI Act)** | Standard | Completa | Completa + Logs de Auditoria Dedicados |
| **Suporte & SLA** | Email (48h) | Email + Chat (24h) | Gerente Dedicado + SLA 99.9% |

---

## 2. REGRAS DE ENFORCEMENT SERVER-SIDE

1. **Zero Confiança no Frontend:** Nenhuma decisão de limite de assentos ou bloqueio de relatórios ocorre em JavaScript do cliente.
2. **Middleware de Quotas:** Toda criação de campanha ou convite de colaborador invoca `checkTenantCommercialLimits(tenantId, resourceType)` no backend antes da persistência.
3. **Grace Period & Degradação Graciosa:** Quando um tenant atinge 100% dos assentos contratados, o sistema permite concluir avaliações em andamento e emite aviso ao Admin, bloqueando apenas a criação de novas campanhas.
