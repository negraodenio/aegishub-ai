export const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_CSV_ROWS = 1000;

export const VALID_ROLES = [
  "admin",
  "rh",
  "manager",
  "sst_professional",
  "health_professional",
  "employee",
  "dpo",
  "auditor"
] as const;

export type ValidRole = (typeof VALID_ROLES)[number];

export interface RosterRow {
  email: string;
  name?: string | undefined;
  role: ValidRole;
  department?: string | undefined;
  employee_code?: string | undefined;
}

export interface CSVParseResult {
  valid: boolean;
  error?: string | undefined;
  totalRows: number;
  validRows: RosterRow[];
  invalidRows: { rowNumber: number; raw: string; error: string }[];
  duplicateEmails: string[];
}

/**
 * 🛡️ Sanitizador de células CSV contra Formula Injection (DDE / CSV Injection)
 * Bloqueia ou neutraliza células iniciadas por '=', '+', '-', '@', '\t', '\r'
 */
export function sanitizeCSVCell(value: string): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@") ||
    trimmed.startsWith("\t") ||
    trimmed.startsWith("\r")
  ) {
    // Escapa com aspas simples para impedir execução em Excel/Calc
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * 📄 Parser e Validador Seguro de CSV de Roster Empresarial
 */
export function parseAndValidateRosterCSV(csvContent: string): CSVParseResult {
  if (!csvContent || csvContent.trim().length === 0) {
    return {
      valid: false,
      error: "CSV_EMPTY: O arquivo enviado está vazio.",
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateEmails: []
    };
  }

  if (Buffer.byteLength(csvContent, "utf8") > MAX_CSV_SIZE_BYTES) {
    return {
      valid: false,
      error: `CSV_OVERSIZED: Arquivo excede o tamanho máximo de ${(MAX_CSV_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB.`,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateEmails: []
    };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return {
      valid: false,
      error: "CSV_NO_DATA: O arquivo não contém linhas de dados além do cabeçalho.",
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateEmails: []
    };
  }

  const dataRows = lines.slice(1);

  if (dataRows.length > MAX_CSV_ROWS) {
    return {
      valid: false,
      error: `CSV_TOO_MANY_ROWS: O arquivo contém ${dataRows.length} linhas, excedendo o limite de ${MAX_CSV_ROWS} colaboradores por lote.`,
      totalRows: dataRows.length,
      validRows: [],
      invalidRows: [],
      duplicateEmails: []
    };
  }

  const validRows: RosterRow[] = [];
  const invalidRows: { rowNumber: number; raw: string; error: string }[] = [];
  const seenEmails = new Set<string>();
  const duplicateEmails: string[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  dataRows.forEach((line, index) => {
    const rowNumber = index + 2; // Linha 1 é o cabeçalho

    // Detecta delimitador (vírgula ou ponto-e-vírgula)
    const delimiter = line.includes(";") ? ";" : ",";
    const parts = line.split(delimiter).map((p) => sanitizeCSVCell(p.replace(/^["']|["']$/g, "")));

    const rawEmail = parts[0]?.toLowerCase() || "";
    const rawName = parts[1] || "";
    const rawRole = (parts[2]?.toLowerCase() || "employee") as ValidRole;
    const rawDepartment = parts[3] || "";
    const rawCode = parts[4] || "";

    if (!rawEmail || !emailRegex.test(rawEmail)) {
      invalidRows.push({ rowNumber, raw: line, error: "EMAIL_INVALID: Formato de e-mail inválido ou ausente." });
      return;
    }

    if (seenEmails.has(rawEmail)) {
      duplicateEmails.push(rawEmail);
      invalidRows.push({ rowNumber, raw: line, error: `EMAIL_DUPLICATE: E-mail duplicado '${rawEmail}'.` });
      return;
    }

    if (!VALID_ROLES.includes(rawRole)) {
      invalidRows.push({
        rowNumber,
        raw: line,
        error: `ROLE_INVALID: Papel '${rawRole}' inválido. Valores aceitos: ${VALID_ROLES.join(", ")}.`
      });
      return;
    }

    seenEmails.add(rawEmail);

    validRows.push({
      email: rawEmail,
      name: rawName || undefined,
      role: rawRole,
      department: rawDepartment || undefined,
      employee_code: rawCode || undefined
    });
  });

  return {
    valid: invalidRows.length === 0,
    totalRows: dataRows.length,
    validRows,
    invalidRows,
    duplicateEmails
  };
}
