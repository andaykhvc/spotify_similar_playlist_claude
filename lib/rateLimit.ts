import { UserFacingError } from "./errors";

// Per-instance sliding window. On serverless each instance keeps its own counts,
// so this is a coarse guard against one client burning the shared API quotas.
const hits = new Map<string, number[]>();

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function rateLimit(bucket: string, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const id = `${bucket}:${key}`;
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const waitMin = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 60_000));
    throw new UserFacingError(`Çok fazla istek attın, ${waitMin} dakika sonra tekrar dene.`, 429);
  }
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now - v[v.length - 1] > windowMs) hits.delete(k);
  }
}
