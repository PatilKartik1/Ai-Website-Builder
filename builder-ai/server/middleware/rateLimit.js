// Process-local fixed-window limiter. For multi-instance production deployments,
// replace this store with a shared Redis-backed limiter.
export function rateLimit({ windowMs, max, message }) {
    const buckets = new Map();

    return function rateLimitMiddleware(req, res, next) {
        const now = Date.now();
        const identity = req.user?.userId || req.ip || req.socket?.remoteAddress || "unknown";
        const key = String(identity);
        let bucket = buckets.get(key);

        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count += 1;
        const remaining = Math.max(0, max - bucket.count);
        const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

        res.setHeader("RateLimit-Limit", String(max));
        res.setHeader("RateLimit-Remaining", String(remaining));
        res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

        // Keep the in-memory store bounded under high-cardinality traffic.
        if (buckets.size > 10_000) {
            for (const [storedKey, storedBucket] of buckets) {
                if (storedBucket.resetAt <= now || buckets.size > 9_000) {
                    buckets.delete(storedKey);
                }
                if (buckets.size <= 9_000) break;
            }
        }

        if (bucket.count > max) {
            res.setHeader("Retry-After", String(retryAfter));
            return res.status(429).json({
                error: message || "Too many requests. Please try again later.",
                retryAfter,
            });
        }

        return next();
    };
}
