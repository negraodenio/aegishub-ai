# P6 SECURITY MATRIX & THREAT MODELING
**Documento:** `P6_SECURITY_MATRIX.md`  
**Data:** 17 de Agosto de 2026  
**Auditor:** Principal Enterprise Security Architect

---

## 1. MATRIZ DE VULNERABILIDADES & ENDURECIMENTO TÉCNICO

| ID | Arquivo / Componente | Linha / Contexto | Vulnerabilidade / Vetor | Severidade | Exploitabilidade | Impacto | Evidência | Correção Recomendada | Teste Necessário |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **SEC-01** | `apps/web/app/api/interventions/[id]/evidence/route.ts` | Linha 45-80 | **Evidence Upload Validation**: Validação de MIME type baseada apenas no header HTTP (vulnerável a spoofing de extensão/MIME). | **P1** | Média | Alto | Header `Content-Type: image/png` pode conter executável disfarçado. | Validar magic bytes binários no buffer e renomear com UUID v4 antes do storage. | Teste de upload de binário `.exe` renomeado para `.png` esperando `400 Bad Request`. |
| **SEC-02** | `supabase/migrations/20260817_cognitive_support_p5.sql` | Linha 158-175 | **SECURITY DEFINER Permissions**: `record_llm_usage` possui permissão de execução default para `public`. | **P1** | Baixa | Médio | Usuário anônimo pode chamar RPC diretamente se conhecer o endpoint. | Executar `REVOKE EXECUTE ON FUNCTION record_llm_usage FROM public; GRANT EXECUTE TO authenticated;`. | Teste de chamada RPC anônima esperando erro de permissão. |
| **SEC-03** | `apps/web/app/api/voice/process/route.ts` | Linha 15-40 | **Rate Limiting em Processamento de Áudio**: Ausência de rate limiting estrito em endpoint de biofonia acústica. | **P1** | Média | Alto | Consumo excessivo de CPU/GPU por requisições concorrentes. | Implementar rate limiting por IP/Tenant (máx 10 req/min). | Teste de flood de 20 requisições simultâneas esperando `429 Too Many Requests`. |
| **SEC-04** | `apps/web/next.config.js` | Config Global | **Security Headers**: Ausência de política CSP e Permissions-Policy explícita nas respostas HTTP. | **P2** | Baixa | Médio | Cabeçalhos default do Next.js sem CSP estrito. | Injetar `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`. | Teste de inspeção de headers em rota pública e privada. |
| **SEC-05** | `apps/web/lib/tenant-context.ts` | Linha 30-55 | **Cookie Manipulation Defense**: Cookie `current_tenant_id` requer validação contínua contra banco. | **P2** | Baixa | Alto | Tentativa de forjar cookie com tenant aleatório. | Já mitigado via `resolveTenantContext` com check server-side; endurecer com HMAC de assinatura no cookie. | Teste de injeção de UUID arbitrário no cookie esperando fallback seguro ou 403. |
| **SEC-06** | `apps/web/app/admin/actions/workspace.ts` | Linha 20-45 | **CSRF em Server Actions**: Server Actions usam mecanismo nativo do Next.js; validar Origin/Referer estrito. | **P2** | Baixa | Médio | Chamadas cross-site forjadas. | Habilitar `serverActions.allowedOrigins` no `next.config.js`. | Teste de invocação de ação com header `Origin: https://evil.com` esperando bloqueio. |
| **SEC-07** | `packages/database/src/repositories/compliance-report.ts` | Linha 80-110 | **Cryptographic Hash Verification**: Relatórios usam SHA-256; auditar integridade periódica contra tampering. | **P2** | Baixa | Alto | Alteração manual de relatório no banco. | Criar trigger no Postgres impedindo `UPDATE` direto na tabela `compliance_reports`. | Teste de `UPDATE` direto em registro de relatório esperando rejeição por trigger. |
| **SEC-08** | `packages/ai-core/src/llm-guard.ts` | Linha 25-45 | **LLM Concurrency Leases**: Leases de quota atômicos precisam expirar automaticamente em caso de crash. | **P2** | Baixa | Baixo | Falha de rede mantendo lease retido. | TTL de 30s implementado; garantir cleanup assíncrono por cron. | Teste de aquisição de lease órfão esperando liberação após 30s. |
| **SEC-09** | `apps/web/app/api/reports/generate/route.ts` | Linha 30-60 | **Resource Exhaustion Denial of Service**: Geração simultânea de relatórios pesados. | **P2** | Média | Médio | Geração concorrente de 50 PDFs grandes travando o servidor. | Enfileirar via `apps/workers` com fila de jobs assíncrona. | Teste de geração paralela de relatórios esperando enfileiramento sem degradação. |
| **SEC-10** | `apps/web/app/employee/cognitive/actions.ts` | Linha 50-80 | **Mass Assignment em Tarefas Cognitivas**: Validação de schema rigorosa nos inputs de micro-etapas. | **P2** | Baixa | Baixo | Injeção de propriedades arbitrárias no JSONB `steps`. | Validar payload com Zod antes de persistir no banco. | Teste de payload com campos maliciosos esperando sanitização. |
| **SEC-11** | `apps/web/app/auth/actions.ts` | Linha 15-40 | **Brute Force em Login/Reset**: Proteção contra ataques de dicionário em rotas de autenticação. | **P3** | Média | Médio | Tentativas massivas de login. | Habilitar rate-limit de IP no Supabase Auth (máx 5 tentativas/min). | Teste de 10 tentativas inválidas esperando bloqueio temporário. |
| **SEC-12** | `apps/web/app/api/campaigns/route.ts` | Linha 20-50 | **Tenant ID Enumeration**: Rejeição de códigos de campanha inválidos sem vazar existência de IDs. | **P3** | Baixa | Baixo | Enumeração de campanhas por código sequencial. | Códigos de campanha utilizam sufixo pseudo-aleatório seguro `AEG-YYYY-XXXXXX`. | Teste de força bruta de códigos esperando mensagens de erro genéricas. |

---

## 2. AUDITORIA DE FUNÇÕES `SECURITY DEFINER`

| Função SQL | Arquivo de Migração | Search Path | Verificação de Tenant | Classificação | Ação Recomendada |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `public.current_tenant_id()` | `20260816_tenant_memberships_and_security_p0.sql` | `public, pg_catalog` | ✅ Sim (`auth.uid()`) | **SAFE** | Nenhuma alteração necessária. |
| `public.current_user_role()` | `20260816_tenant_memberships_and_security_p0.sql` | `public, pg_catalog` | ✅ Sim (`auth.uid()`) | **SAFE** | Nenhuma alteração necessária. |
| `public.complete_clinical_assessment()` | `20260815_remediation_v1.sql` | `public, pg_catalog` | ✅ Sim (UUID match) | **SAFE** | Nenhuma alteração necessária. |
| `public.record_llm_usage()` | `20260817_cognitive_support_p5.sql` | `public, pg_catalog` | ✅ Sim (`auth.uid()`) | **NEEDS HARDENING** | Revogar `EXECUTE` de `public` e conceder a `authenticated`. |
| `public.calculate_campaign_aggregates()` | `20260816_campaign_management_p1.sql` | `public, pg_catalog` | ✅ Sim ($N \ge 5$) | **SAFE** | Nenhuma alteração necessária. |

---

## 3. AUDITORIA DE SEGREDOS & AMBIENTE

- **`SUPABASE_SERVICE_ROLE_KEY`:** Isolada estritamente no ambiente do servidor; zero importação em arquivos com diretiva `"use client"`.
- **`OPENAI_API_KEY` / `ANTHROPIC_API_KEY`:** Injetadas exclusivamente via variáveis de ambiente seguras no runtime serverless/Node.js.
- **`NEXT_PUBLIC_*`:** Apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são expostas ao browser, com acesso restrito via RLS.
