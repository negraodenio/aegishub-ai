/**
 * 🛡️ Detector de Dados Sensíveis & PII (Prevenção de Vazamento antes do LLM)
 * - Detecta credenciais, chaves, tokens, JWTs, e-mails e connection strings
 * - Pure logic, seguro para uso em runtime isolado
 */

const SENSITIVE_DATA_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i, // UUID
  /\bBearer\s+[A-Za-z0-9._~+\/-]+=*/i, // Bearer Token
  /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\b/, // JWT
  /\b(?:sk-(?:proj-)?|sk-or-v1-|ghp_|github_pat_|glpat-|AIza|AKIA)[A-Za-z0-9_\-]{16,}\b/, // API Keys
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, // Private Keys
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s]+/i // DB URIs
];

const CREDENTIAL_NAME_PATTERN =
  /(?:^|_)(?:API_KEY|ACCESS_TOKEN|AUTH_TOKEN|SESSION_TOKEN|TOKEN|SECRET|SECRET_KEY|SECRET_ACCESS_KEY|PRIVATE_KEY|CLIENT_SECRET|SERVICE_ROLE_KEY|PASSWORD|PASSWD|PWD|DATABASE_URL|DATABASE_URI|CONNECTION_STRING)$/i;

const CREDENTIAL_ASSIGNMENT_PATTERN =
  /\b([A-Za-z][A-Za-z0-9_]*)\s*=\s*(?:"[^"\r\n]{4,}"|'[^'\r\n]{4,}'|[^\s"']{4,})/g;

function containsCredentialAssignment(input: string): boolean {
  for (const match of input.matchAll(CREDENTIAL_ASSIGNMENT_PATTERN)) {
    const key = match[1];
    if (key && CREDENTIAL_NAME_PATTERN.test(key)) {
      return true;
    }
  }
  return false;
}

/**
 * Retorna true se a string contiver qualquer padrão de dado sensível, PII ou segredo
 */
export function containsSensitiveData(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return (
    SENSITIVE_DATA_PATTERNS.some((pattern) => pattern.test(input)) ||
    containsCredentialAssignment(input)
  );
}
