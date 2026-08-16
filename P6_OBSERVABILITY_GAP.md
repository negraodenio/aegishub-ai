# P6 OBSERVABILITY & SYSTEM HEALTH SPECIFICATION
**Documento:** `P6_OBSERVABILITY_GAP.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Reliability & Observability Architect

---

## 1. INFRAESTRUTURA DE LOGS ESTRUTURADOS & TELEMETRIA

Para escala enterprise, toda requisição deve carregar um contexto de correlação estruturado:

```json
{
  "timestamp": "2026-08-17T10:30:00.000Z",
  "level": "INFO",
  "correlationId": "req_8f3a9b1c-72e1-4b8a-9a1f-0e123456789a",
  "tenantId": "11111111-1111-1111-1111-111111111111",
  "endpoint": "/api/reports/generate",
  "method": "POST",
  "durationMs": 245,
  "statusCode": 200,
  "service": "api-gateway",
  "llmTokensUsed": 450,
  "llmCostUsd": 0.0009
}
```

*Regra de Privacidade:* NUNCA registrar em logs: senhas, tokens de autenticação, nomes de colaboradores, textos de tarefas cognitivas ou conteúdos clínicos.

---

## 2. ESPECIFICAÇÃO DE HEALTH CHECKS

### A. Liveness Probe (`GET /api/health`)
- Verifica se o servidor Node.js/Next.js está responsivo.
- Retorna `{"status": "ok", "uptime": 12345, "timestamp": "..."}` com status `200`.

### B. Readiness Probe (`GET /api/ready`)
- Verifica a conectividade dos subsistemas críticos:
  1. Conexão PostgreSQL / Supabase (`SELECT 1`).
  2. Acesso ao Supabase Storage bucket (`action-evidence`).
  3. Responsividade do gateway de LLM.
- Retorna `200 OK` se todos os componentes estiverem operacionais; `503 Service Unavailable` se houver indisponibilidade no banco de dados.

---

## 3. MATRIZ DE REGRAS DE ALERTA (ALERTING RULES)

| Código do Alerta | Evento Gatilho | Limiar / Janela | Severidade | Ação Automática |
| :--- | :--- | :--- | :---: | :--- |
| **ALT-01** | Tentativas de Autenticação Inválidas | > 10 falhas / 1 min por IP | **P1 (Alto)** | Bloqueio temporário de IP e notificação ao time de segurança. |
| **ALT-02** | Respostas 401 / 403 Consecutivas (IDOR) | > 5 tentativas / 1 min por usuário | **P1 (Alto)** | Alerta de potencial tentativa de escalada de privilégios. |
| **ALT-03** | Consumo Anômalo de Custos de LLM | Custo diário do tenant > $50.00 | **P2 (Médio)** | Throttle administrativo e aviso ao gestor do tenant. |
| **ALT-04** | Falha de Conectividade com Banco | Erros 500 no Supabase > 1% / 5 min | **P0 (Crítico)** | Alerta imediato via PagerDuty / canal de plantão SRE. |
| **ALT-05** | Drift ou Rejeição de IA em Massa | Rejeição humana de medidas de IA > 30% | **P2 (Médio)** | Isolamento do modelo e ativação do fallback de SST. |
