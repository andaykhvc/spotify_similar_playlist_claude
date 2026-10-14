import { env } from "./session";

const API = "https://ws.audioscrobbler.com/2.0/";

export type LastfmTrack = { artist: string; title: string; match: number };

// Last.fm asks for roughly <= 5 requests/second per client; space calls out globally.
const MIN_INTERVAL_MS = 220;
let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + MIN_INTERVAL_MS;
  if (wait) await new Promise((r) => setTimeout(r, wait));
}

// Similarity data barely changes; cache it in-process for a day.
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;
const cache = new Map<string, { at: number; data: unknown }>();

async function call<T>(method: string, params: Record<string, string>): Promise<T | null> {
  const qs = new URLSearchParams({ method, ...params, autocorrect: "1", format: "json" });
  const cacheKey = qs.toString();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data as T;

  qs.set("api_key", env.lastfmKey);
  await throttle();
  const res = await fetch(`${API}?${qs}`, { headers: { "User-Agent": "spotify-similar/0.1" } });
  const body = await res.json().catch(() => null);
  // Error 6 = "track/artist not found": a normal, cacheable miss.
  if (body?.error === 6) {
    remember(cacheKey, null);
    return null;
  }
  if (!res.ok || !body || body.error) {
    throw new Error(`Last.fm ${method} failed: ${body?.message ?? res.status}`);
  }
  remember(cacheKey, body);
  return body as T;
}

function remember(key: string, data: unknown) {
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), data });
}

type RawTrack = { name: string; match?: string | number; artist: { name: string } };
// Last.fm returns a bare object instead of an array when there is exactly one result.
const asArray = <T>(x: T | T[] | undefined): T[] => (x === undefined ? [] : Array.isArray(x) ? x : [x]);

export async function getSimilarTracks(artist: string, title: string, limit = 25): Promise<LastfmTrack[]> {
  const body = await call<{ similartracks?: { track?: RawTrack | RawTrack[] } }>("track.getSimilar", {
    artist,
    track: title,
    limit: String(limit),
  });
  return asArray(body?.similartracks?.track).map((t) => ({
    artist: t.artist.name,
    title: t.name,
    match: Number(t.match ?? 0),
  }));
}

export async function getSimilarArtists(artist: string, limit = 5): Promise<{ name: string; match: number }[]> {
  type Raw = { name: string; match?: string | number };
  const body = await call<{ similarartists?: { artist?: Raw | Raw[] } }>("artist.getSimilar", {
    artist,
    limit: String(limit),
  });
  return asArray(body?.similarartists?.artist).map((a) => ({ name: a.name, match: Number(a.match ?? 0) }));
}

export async function getArtistTopTracks(artist: string, limit = 3): Promise<LastfmTrack[]> {
  const body = await call<{ toptracks?: { track?: RawTrack | RawTrack[] } }>("artist.getTopTracks", {
    artist,
    limit: String(limit),
  });
  return asArray(body?.toptracks?.track)
    .slice(0, limit)
    .map((t) => ({ artist: t.artist.name, title: t.name, match: 1 }));
}
