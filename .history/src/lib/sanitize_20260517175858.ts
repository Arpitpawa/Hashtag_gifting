/**
 * Strip HTML tags and dangerous characters from user input
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/[<>'"`;]/g, "")          // strip dangerous chars
    .trim()
    .slice(0, 10000);                  // max length safety
}

export function sanitizeSearchQuery(input: string): string {
  return input
    .replace(/[^\w\s\-\.]/g, "")       // only alphanumeric + space + dash + dot
    .trim()
    .slice(0, 100);
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      clean[key] = sanitizeString(value);
    } else if (typeof value === "number") {
      clean[key] = value;
    } else if (typeof value === "boolean") {
      clean[key] = value;
    } else if (value === null || value === undefined) {
      clean[key] = value;
    } else if (typeof value === "object") {
      clean[key] = sanitizeObject(value);
    }
  }
  return clean;
}