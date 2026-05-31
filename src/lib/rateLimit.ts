// Simple in-memory rate limiter — use Redis for production at scale
const requests = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  maxRequests: number;  // max requests per window
  windowMs:    number;  // window in milliseconds
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60_000 }
): { success: boolean; remaining: number; resetAt: number } {
  const now     = Date.now();
  const current = requests.get(identifier);

  // Expired window — reset
  if (!current || now > current.resetAt) {
    requests.set(identifier, {
      count:   1,
      resetAt: now + options.windowMs,
    });
    return {
      success:   true,
      remaining: options.maxRequests - 1,
      resetAt:   now + options.windowMs,
    };
  }

  // Within window
  if (current.count >= options.maxRequests) {
    return {
      success:   false,
      remaining: 0,
      resetAt:   current.resetAt,
    };
  }

  current.count++;
  return {
    success:   true,
    remaining: options.maxRequests - current.count,
    resetAt:   current.resetAt,
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of requests.entries()) {
    if (now > val.resetAt) requests.delete(key);
  }
}, 5 * 60_000);