const store = new Map();

export function createRateLimiter({ windowMs, maxRequests }) {
  return {
    check(identifier) {
      const now = Date.now();
      const key = identifier;

      // Clean up expired entries
      for (const [k, v] of store) {
        if (now > v.resetAt) {
          store.delete(k);
        }
      }

      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });
        return {
          success: true,
          remaining: maxRequests - 1,
          resetAt: now + windowMs,
        };
      }

      if (entry.count >= maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetAt: entry.resetAt,
        };
      }

      entry.count++;
      return {
        success: true,
        remaining: maxRequests - entry.count,
        resetAt: entry.resetAt,
      };
    },
  };
}

export function rateLimitHeaders(limit, remaining, resetAt) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

export const checkoutLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
});

export const portalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
});

export const sampleDataLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
});
