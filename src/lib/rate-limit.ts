// Small in-memory limiter. The dashboard runs as a single container, so process memory
// is enough; counters reset on restart, which is acceptable for abuse protection.

const hits = new Map<string, number[]>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    // Keep entries for up to a day (the longest window used)
    if (times.length === 0 || now - times[times.length - 1] > 86_400_000) hits.delete(key);
  }
}

/** True if allowed (and records the hit); false if `key` already used up `limit` in `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** True if a hit would be allowed, without recording one. */
export function canHit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  return (hits.get(key) ?? []).filter((t) => now - t < windowMs).length < limit;
}

/** The visitor's IP. The dashboard sits behind Cloudflare, which sets cf-connecting-ip. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}
