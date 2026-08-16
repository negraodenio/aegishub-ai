# AEGISHUB AI — P6.4 OBSERVABILITY & OPERATIONAL MONITORING ARCHITECTURE
**Documento:** `P6_4_OBSERVABILITY_ARCHITECTURE.md`  
**Data:** 17 de Agosto de 2026  
**Auditor / Arquiteto:** Principal Enterprise Security & AI Compliance Architect  
**Status:** IMPLEMENTADO & INTEGRADO

---

## 1. FLUXO OPERACIONAL DE OBSERVABILIDADE

$$\begin{matrix}
\text{HTTP REQUEST} & \longrightarrow & \text{RESOLVE CORRELATION ID} & \longrightarrow & \text{MIDDLEWARE / ROUTE} \\
\downarrow & & \downarrow & & \downarrow \\
\text{PRIVACY-SAFE LOGGER} & \longleftarrow & \text{OPERATIONAL METRICS} & \longleftarrow & \text{AI GOVERNANCE TRACE} \\
\downarrow & & & & \\
\text{HEALTH & READY PROBES} & \longrightarrow & \text{ALERT RULES TAXONOMY} & \longrightarrow & \text{AUDIT INTEGRATION}
\end{matrix}$$

---

## 2. COMPONENTES E ESPECIFICAÇÃO TÉCNICA

### 🆔 1. Correlation ID Global (`X-Correlation-ID`)
- **Módulo:** [`packages/ai-core/src/observability/correlation.ts`](file:///c:/Users/denio/Documents/Denio/PTSaude/packages/ai-core/src/observability/correlation.ts)
- **Regras:**
  - Validação estrita de formato (alfanumérico, hífens e underscores, 8 a 64 caracteres).
  - Regeneração automática em caso de valor malformado ou ausente.
  - Injeção obrigatória no cabeçalho de resposta HTTP (`X-Correlation-ID`).

### 📝 2. Structured Logging & Redação de Privacidade (RGPD/LGPD)
- **Módulo:** [`packages/ai-core/src/observability/logger.ts`](file:///c:/Users/denio/Documents/Denio/PTSaude/packages/ai-core/src/observability/logger.ts)
- **Schema do Log JSON:**
  ```json
  {
    "timestamp": "2026-08-17T12:00:00.000Z",
    "level": "INFO",
    "service": "aegishub-core",
    "environment": "production",
    "correlationId": "corr_1786900000_a1b2c3d4",
    "route": "/api/campaigns",
    "method": "GET",
    "status": 200,
    "durationMs": 45,
    "tenantId": "11111111-1111-1111-1111-111111111111"
  }
  ```
- **Campos Censurados Automaticamente (`[REDACTED_CONFIDENTIAL]`):**
  `password`, `token`, `access_token`, `refresh_token`, `api_key`, `secret`, `prompt`, `prompt_text`, `clinical_note`, `diagnosis`, `medical_record`, `nif`, `cpf`, `cnpj`, `audio_data`.

### 🚨 3. Taxonomia Estruturada de Erros
- **Módulo:** [`packages/ai-core/src/observability/errors.ts`](file:///c:/Users/denio/Documents/Denio/PTSaude/packages/ai-core/src/observability/errors.ts)
- **Códigos Padronizados:**
  `AUTH_REQUIRED`, `FORBIDDEN`, `TENANT_ACCESS_DENIED`, `VALIDATION_ERROR`, `RATE_LIMITED`, `DATABASE_ERROR`, `EXTERNAL_SERVICE_ERROR`, `AI_GOVERNANCE_ERROR`, `PRIVACY_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`.
- **Payload ao Cliente:** `{ errorCode, message, correlationId, timestamp }` (Zero vazamento de SQL ou stack traces).

### 🩺 4. Health & Readiness Probes
- **Liveness Probe (`GET /api/health`):**
  - Valida se o processo Node.js / Next.js está vivo e recebendo conexões.
  - Resposta HTTP 200: `{ status: "ok", service: "aegishub-web", timestamp, correlationId }`.
- **Readiness Probe (`GET /api/ready`):**
  - Valida se o banco de dados Supabase está acessível e operacional.
  - Resposta HTTP 200: `{ status: "ready", checks: { database: "ok" }, latencyMs, timestamp, correlationId }`.
  - Resposta HTTP 503 caso o banco esteja inacessível.

---

## 3. MATRIZ DE REGRAS DE ALERTA OPERACIONAL

| Nível | Condição de Disparo | Ação Técnica | Estado da Integração |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | Falha de conectividade no banco (`/api/ready` $\to$ 503) | Notificação imediata SRE / Falha de deploy | **CONFIGURADO (Endpoint Operacional)** |
| **CRITICAL** | Incidente de IA de Risco Alto (`ai_incidents` status `detected`) | Alerta ao DPO / Comitê de Governança | **IMPLEMENTADO (P6.3 Ledger)** |
| **HIGH** | Taxa elevada de `429 RATE_LIMITED` ($> 50$ em 1 min) | Investigação de ataque DoS / Flood | **CONFIGURADO (Métricas Internas)** |
| **HIGH** | Falhas repetidas de autenticação ou violação cross-tenant | Notificação de segurança (SOC) | **CONFIGURADO (Audit Trail)** |
| **MEDIUM** | Degradação de latência média ($> 1500\text{ms}$) | Avaliação de queries e índices | **CONFIGURADO (Métricas Internas)** |

---

## 4. DECLARAÇÃO DE STATUS DE IMPLEMENTAÇÃO

- **IMPLEMENTADO:**
  - Gerador e validador de Correlation ID (`resolveCorrelationId`).
  - Logger estruturado com censura automática de PII e segredos (`StructuredLogger`).
  - Coletor de métricas operacionais reais sem números falsificados (`OperationalMetricsCollector`).
  - Health probe pública `/api/health`.
  - Readiness probe `/api/ready` com validação de banco.
  - Taxonomia estruturada de erros (`AppError` & `ErrorCode`).
- **CONFIGURADO:**
  - Regras de severidade de alertas (Critical, High, Medium).
  - Injeção de Correlation ID em middleware.
- **DEPENDENTE DE INFRAESTRUTURA EXTERNA:**
  - Encaminhamento de logs para datalake corporativo (ex: Datadog / OpenTelemetry / Prometheus / Grafana / AWS CloudWatch) quando contratado pelo cliente.
