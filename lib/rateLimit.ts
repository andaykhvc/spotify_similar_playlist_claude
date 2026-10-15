import { UserFacingError } from "./errors";

// Per-instance sliding window. On serverless each instance keeps its own counts,
// so this is a coarse guard against one client burning the shared API quotas.
const hits = new Map<string, number[]>();

// IPs are personal data: forget them once no window can still need them.
// The privacy page promises this (app/gizlilik/page.tsx).
const MAX_WINDOW_MS = 10 * 60_000;
const SWEEP_EVERY_MS = 60_000;
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [k, v] of hits) if (now - v[v.length - 1] > MAX_WINDOW_MS) hits.delete(k);
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function rateLimit(bucket: string, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const id = `${bucket}:${key}`;
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const waitMin = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 60_000));
    throw new UserFacingError("rateLimited", [waitMin], 429);
  }
  recent.push(now);
  hits.set(id, recent);
}
