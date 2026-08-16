import crypto from "crypto";
import path from "path";

export interface FileValidationResult {
  valid: boolean;
  error?: string | undefined;
  sanitizedFilename?: string | undefined;
  detectedMime?: string | undefined;
  fileHash?: string | undefined;
}


export const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"] as const;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * 🛡️ Validação de integridade e segurança de uploads (Magic Bytes & Anti-Malware Sandbox)
 * - Valida magic bytes binários reais
 * - Bloqueia executáveis (PE/MZ, ELF, Mach-O)
 * - Bloqueia scripts (SVG/HTML, PHP, JS, script tags)
 * - Sanitiza nome do arquivo contra Path Traversal
 * - Calcula hash SHA-256 para integridade
 */
export function validateEvidenceFileBuffer(
  buffer: Buffer,
  originalFilename: string,
  declaredMime?: string
): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "FILE_EMPTY: O arquivo enviado está vazio." };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `FILE_TOO_LARGE: Tamanho de ${(buffer.length / (1024 * 1024)).toFixed(1)}MB excede o limite máximo de 10MB.`
    };
  }

  // 1. Sanitização de Nome de Arquivo e Prevenção de Path Traversal
  const baseName = path.basename(originalFilename || "evidence.bin");
  const ext = path.extname(baseName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return {
      valid: false,
      error: `INVALID_EXTENSION: Extensão '${ext}' não permitida. Extensões aceitas: ${ALLOWED_EXTENSIONS.join(", ")}.`
    };
  }

  // 2. Detecção de Magic Bytes Reais
  const detected = detectMagicBytes(buffer);
  if (!detected.allowed) {
    return {
      valid: false,
      error: `MALICIOUS_OR_UNSUPPORTED_FILE: Cabeçalho binário inválido ou tipo de arquivo proibido (${detected.reason}).`
    };
  }

  // 3. Verificação de Injeção de Scripts (SVG/HTML/Polyglot)
  const headerSample = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("utf8").toLowerCase();
  if (
    headerSample.includes("<script") ||
    headerSample.includes("<?php") ||
    headerSample.includes("<svg") ||
    headerSample.includes("<html") ||
    headerSample.includes("onload=") ||
    headerSample.includes("javascript:")
  ) {
    return {
      valid: false,
      error: "SCRIPT_INJECTION_DETECTED: O arquivo contém código executável ou scripts proibidos."
    };
  }

  // 4. Sanitização de Nome com UUID v4
  const randomSuffix = crypto.randomUUID();
  const safeFilename = `evidence_${randomSuffix}${ext}`;

  // 5. Cálculo do Hash SHA-256 para auditoria e integridade imutável
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    valid: true,
    sanitizedFilename: safeFilename,
    detectedMime: detected.mime,
    fileHash
  };
}

function detectMagicBytes(buffer: Buffer): { allowed: boolean; mime?: string; reason?: string } {
  if (buffer.length < 4) {
    return { allowed: false, reason: "Buffer muito curto para validação de cabeçalho" };
  }

  const b0 = buffer[0]!;
  const b1 = buffer[1]!;
  const b2 = buffer[2]!;
  const b3 = buffer[3]!;

  // Executáveis Proibidos (PE/Windows .exe/.dll: 'MZ', ELF/Linux: '\x7FELF', Mach-O: 0xFE/0xED/0xFA)
  if (b0 === 0x4d && b1 === 0x5a) {
    return { allowed: false, reason: "Executável Windows PE detectado (MZ Header)" };
  }
  if (b0 === 0x7f && b1 === 0x45 && b2 === 0x4c && b3 === 0x46) {
    return { allowed: false, reason: "Executável Linux ELF detectado" };
  }

  // PDF (%PDF-) -> 0x25 0x50 0x44 0x46
  if (b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46) {
    return { allowed: true, mime: "application/pdf" };
  }

  // PNG (\x89PNG) -> 0x89 0x50 0x4E 0x47
  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) {
    return { allowed: true, mime: "image/png" };
  }

  // JPEG (\xFF\xD8\xFF)
  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) {
    return { allowed: true, mime: "image/jpeg" };
  }

  // WebP (RIFF....WEBP) -> 0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50
  if (buffer.length >= 12) {
    const isRiff = b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46;
    const isWebp =
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    if (isRiff && isWebp) {
      return { allowed: true, mime: "image/webp" };
    }
  }

  return { allowed: false, reason: "Tipo binário não reconhecido ou formato não autorizado" };
}
