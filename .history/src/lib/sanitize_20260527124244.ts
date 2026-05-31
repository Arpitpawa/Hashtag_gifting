// ── SANITIZE LIBRARY — comprehensive input security ──────────────────────────

/**
 * Strip HTML tags, dangerous chars, SQL injection patterns
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")                          // strip HTML tags
    .replace(/[<>'"`]/g, "")                          // strip XSS chars
    .replace(/javascript:/gi, "")                     // strip JS protocol
    .replace(/on\w+\s*=/gi, "")                       // strip event handlers
    .replace(/data:/gi, "")                           // strip data URIs
    .replace(/vbscript:/gi, "")                       // strip VBScript
    .trim()
    .slice(0, 10000);
}

/**
 * Sanitize search queries — very strict, alphanumeric only
 */
export function sanitizeSearchQuery(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[^\w\s\-\.]/g, "")
    .trim()
    .slice(0, 100);
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .toLowerCase()
    .replace(/[^a-z0-9@._\-+]/g, "")
    .trim()
    .slice(0, 254);
}

/**
 * Sanitize phone numbers — digits, +, spaces, dashes only
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[^\d\s\+\-\(\)]/g, "")
    .trim()
    .slice(0, 20);
}

/**
 * Sanitize pincode — digits only
 */
export function sanitizePincode(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/\D/g, "").slice(0, 10);
}

/**
 * Sanitize integers — prevent injection via numeric fields
 */
export function sanitizeInt(input: any, fallback = 0): number {
  const n = parseInt(String(input), 10);
  return isNaN(n) || !isFinite(n) ? fallback : Math.max(0, n);
}

/**
 * Sanitize floats
 */
export function sanitizeFloat(input: any, fallback = 0): number {
  const n = parseFloat(String(input));
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

/**
 * Deep sanitize — handles nested objects + arrays correctly
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" && item !== null ? sanitizeObject(item) : item
    ) as any;
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize the key too — prevent prototype pollution
    const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, "");
    if (!cleanKey || cleanKey === "__proto__" || cleanKey === "constructor" || cleanKey === "prototype") continue;

    if (typeof value === "string") {
      clean[cleanKey] = sanitizeString(value);
    } else if (typeof value === "number") {
      clean[cleanKey] = isFinite(value) ? value : 0;
    } else if (typeof value === "boolean") {
      clean[cleanKey] = value;
    } else if (value === null || value === undefined) {
      clean[cleanKey] = value;
    } else if (Array.isArray(value)) {
      clean[cleanKey] = value.map((item) =>
        typeof item === "object" && item !== null ? sanitizeObject(item) : item
      );
    } else if (typeof value === "object") {
      clean[cleanKey] = sanitizeObject(value);
    }
  }
  return clean;
}

/**
 * Validate & sanitize file uploads — prevents malware uploads
 */
export interface FileValidationResult {
  valid:   boolean;
  error?:  string;
  warning?: string;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const DANGEROUS_EXTENSIONS = [
  ".exe", ".php", ".js", ".html", ".htm", ".sh", ".bat", ".cmd",
  ".ps1", ".vbs", ".jar", ".py", ".rb", ".pl", ".cgi", ".asp",
  ".aspx", ".jsp", ".sql", ".xml", ".svg", // SVG can contain XSS
];

export function validateImageFile(file: File, maxSizeMB = 8): FileValidationResult {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPG, PNG, WEBP and GIF images are allowed." };
  }

  // Check file extension
  const fileName    = file.name.toLowerCase();
  const hasDangerous = DANGEROUS_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (hasDangerous) {
    return { valid: false, error: "This file type is not allowed." };
  }

  // Double extension check — e.g. "image.jpg.php"
  const parts = fileName.split(".");
  if (parts.length > 2) {
    const secondaryExt = `.${parts[parts.length - 2]}`;
    if (DANGEROUS_EXTENSIONS.includes(secondaryExt)) {
      return { valid: false, error: "Invalid file name." };
    }
  }

  return { valid: true };
}

/**
 * Validate image buffer — checks magic bytes (file signature)
 * Prevents disguised files (e.g. PHP renamed to .jpg)
 */
export function validateImageBuffer(buffer: Buffer): FileValidationResult {
  if (buffer.length < 4) {
    return { valid: false, error: "Invalid file." };
  }

  // Check magic bytes (file signatures)
  const jpg  = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const png  = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  const webp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  const gif  = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

  if (!jpg && !png && !webp && !gif) {
    return { valid: false, error: "File does not appear to be a valid image. Upload rejected." };
  }

  return { valid: true };
}

/**
 * Detect SQL injection patterns in strings
 */
const SQL_INJECTION_PATTERNS = [
  /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b|\bEXEC\b|\bUNION\b)/i,
  /('|\"|;|--|\*|\/\*|\*\/)/,
  /(\bOR\b|\bAND\b)\s+[\d'"].*=/i,
  /\bxp_\w+/i,
  /\bCAST\s*\(/i,
  /\bCONVERT\s*\(/i,
  /\bCHAR\s*\(/i,
  /\bDECLARE\s+/i,
];

export function containsSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Detect XSS patterns in strings
 */
const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /eval\s*\(/i,
  /document\.cookie/i,
  /window\.location/i,
  /document\.write/i,
  /\.innerHTML/i,
];

export function containsXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Full input validation — returns error message if suspicious
 */
export function validateInput(input: string, fieldName = "Input"): string | null {
  if (containsSQLInjection(input)) {
    return `${fieldName} contains invalid characters.`;
  }
  if (containsXSS(input)) {
    return `${fieldName} contains invalid content.`;
  }
  return null;
}