// Pure recommendation logic: no network, no Next.js. I/O lives in generate.ts.
import { ALT_TAKE, normalizeArtist, normalizeTitle, trackKey } from "./normalize";

export type TrackRef = { artist: string; title: string };
export type ScoredTrack = TrackRef & { match: number };

export type SimilarResult = {
  seed: TrackRef;
  tracks: ScoredTrack[];
  /** Down-weights fallback (artist-based) results relative to direct track similarity. */
  weight: number;
};

export type Candidate = TrackRef & {
  key: string;
  score: number;
  /** Seed titles that led to this candidate, strongest first. */
  because: string[];
};

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks up to `max` seeds, round-robin across artists so one dominant artist
 * can't fill every seed slot. Duplicate songs are collapsed.
 */
export function selectSeeds<T extends TrackRef>(tracks: T[], max: number, rng: () => number = Math.random): T[] {
  const byArtist = new Map<string, T[]>();
  const seen = new Set<string>();
  for (const t of tracks) {
    const key = trackKey(t.artist, t.title);
    if (seen.has(key)) continue;
    seen.add(key);
    const a = normalizeArtist(t.artist);
    byArtist.set(a, [...(byArtist.get(a) ?? []), t]);
  }
  const groups = shuffle([...byArtist.values()], rng).map((g) => shuffle(g, rng));
  const out: T[] = [];
  for (let round = 0; out.length < max; round++) {
    let added = false;
    for (const g of groups) {
      if (round < g.length && out.length < max) {
        out.push(g[round]);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

/**
 * Merges per-seed similarity lists. A candidate's score is the sum of its
 * weighted match values, so songs recommended by several seeds rise to the top.
 * Anything whose key is in `exclude` (i.e. already in the source playlist) is dropped.
 */
export function aggregateCandidates(results: SimilarResult[], exclude: Set<string>): Candidate[] {
  const byKey = new Map<string, Candidate & { contrib: Map<string, number> }>();
  for (const { seed, tracks, weight } of results) {
    for (const t of tracks) {
      const key = trackKey(t.artist, t.title);
      if (exclude.has(key) || !normalizeTitle(t.title)) continue;
      const gain = t.match * weight;
      let c = byKey.get(key);
      if (!c) {
        c = { key, artist: t.artist, title: t.title, score: 0, because: [], contrib: new Map() };
        byKey.set(key, c);
      }
      c.score += gain;
      c.contrib.set(seed.title, (c.contrib.get(seed.title) ?? 0) + gain);
    }
  }
  return [...byKey.values()]
    .map(({ contrib, ...c }) => ({
      ...c,
      because: [...contrib.entries()].sort((a, b) => b[1] - a[1]).map(([title]) => title),
    }))
    .sort((a, b) => b.score - a.score || b.because.length - a.because.length);
}

/** Keeps order but allows at most `maxPerArtist` songs per artist. */
export function diversify<T extends TrackRef>(items: T[], maxPerArtist: number): T[] {
  const counts = new Map<string, number>();
  return items.filter((it) => {
    const a = normalizeArtist(it.artist);
    const n = counts.get(a) ?? 0;
    if (n >= maxPerArtist) return false;
    counts.set(a, n + 1);
    return true;
  });
}

type SearchHit = { name: string; artists: { name: string }[] };

/** Chooses the search result that is really the wanted song, or null if none is. */
export function pickSpotifyMatch<T extends SearchHit>(want: TrackRef, hits: T[]): T | null {
  const wantTitle = normalizeTitle(want.title);
  const wantArtist = normalizeArtist(want.artist);
  const artistOk = (h: SearchHit) => h.artists.some((a) => normalizeArtist(a.name) === wantArtist);

  const exact = hits.find((h) => artistOk(h) && normalizeTitle(h.name) === wantTitle);
  if (exact) return exact;
  // "Song" vs "Song - From the Motion Picture X" and similar suffixes,
  // but never swap the original for a remix/live/etc. take or vice versa.
  return (
    hits.find((h) => {
      if (!artistOk(h)) return false;
      const t = normalizeTitle(h.name);
      if (ALT_TAKE.test(t) !== ALT_TAKE.test(wantTitle)) return false;
      return t.startsWith(`${wantTitle} `) || wantTitle.startsWith(`${t} `);
    }) ?? null
  );
}
