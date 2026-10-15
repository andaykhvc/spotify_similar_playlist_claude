import pLimit from "p-limit";
import { EMBED_TRACK_LIMIT, fetchEmbedPlaylist } from "./embed";
import { UserFacingError } from "./errors";
import { getArtistTopTracks, getSimilarArtists, getSimilarTracks } from "./lastfm";
import { normalizeTitle, trackKey } from "./normalize";
import {
  aggregateCandidates,
  diversify,
  pickSpotifyMatch,
  selectSeeds,
  type Candidate,
  type SimilarResult,
  type TrackRef,
} from "./similar";
import {
  getPlaylistMeta,
  getPlaylistTracks,
  searchTracks,
  SpotifyError,
  toSourceTrack,
  type SourceTrack,
  type SpotifyTrack,
} from "./spotify";

export { UserFacingError };

const MAX_SEEDS = 30;
const MAX_PER_ARTIST = 2;
const FALLBACK_WEIGHT = 0.5;

export type Source = {
  name: string;
  tracks: SourceTrack[];
  /** True when the embed page cut the playlist off at its track limit. */
  partial?: boolean;
};

export type SuggestedTrack = {
  id: string;
  uri: string;
  name: string;
  artists: string[];
  image: string | null;
  because: string[];
};

export type GenerateResult = {
  source: { name: string; trackCount: number; partial: boolean };
  tracks: SuggestedTrack[];
  stats: { seeds: number; candidates: number; searched: number };
};

/**
 * Reads a playlist's tracks. With a user token the Web API gives the full list, but in dev mode only
 * for playlists the user owns/collaborates on; everything else falls back to the public embed page.
 */
export async function resolvePlaylist(userToken: string | null, playlistId: string): Promise<Source> {
  if (userToken) {
    try {
      const [meta, tracks] = await Promise.all([
        getPlaylistMeta(userToken, playlistId),
        getPlaylistTracks(userToken, playlistId),
      ]);
      return { name: meta.name, tracks: tracks.map(toSourceTrack) };
    } catch (e) {
      if (!(e instanceof SpotifyError && (e.status === 403 || e.status === 404))) throw e;
    }
  }
  const embed = await fetchEmbedPlaylist(playlistId);
  return { ...embed, partial: embed.tracks.length >= EMBED_TRACK_LIMIT };
}

async function similarForSeed(seed: TrackRef): Promise<SimilarResult | null> {
  try {
    const direct = await getSimilarTracks(seed.artist, seed.title, 25);
    if (direct.length) return { seed, tracks: direct, weight: 1 };

    // Obscure track: borrow top songs from artists similar to the seed's artist.
    const artists = (await getSimilarArtists(seed.artist, 3)).filter((a) => a.match > 0);
    const tops = await Promise.all(
      artists.map(async (a) => (await getArtistTopTracks(a.name, 3)).map((t) => ({ ...t, match: a.match }))),
    );
    return { seed, tracks: tops.flat(), weight: FALLBACK_WEIGHT };
  } catch (e) {
    console.warn(`[similar] seed "${seed.artist} - ${seed.title}" failed:`, e);
    return null;
  }
}

// Search results don't depend on the user, so share them across requests.
const searchCache = new Map<string, SpotifyTrack | null>();

async function findOnSpotify(token: string, c: Candidate): Promise<SpotifyTrack | null> {
  if (searchCache.has(c.key)) return searchCache.get(c.key)!;
  const clean = (s: string) => s.replace(/"/g, "");
  let hit = pickSpotifyMatch(c, await searchTracks(token, `track:"${clean(c.title)}" artist:"${clean(c.artist)}"`));
  if (!hit) {
    hit = pickSpotifyMatch(c, await searchTracks(token, `${normalizeTitle(c.title)} ${clean(c.artist)}`));
  }
  if (searchCache.size > 20_000) searchCache.clear();
  searchCache.set(c.key, hit);
  return hit;
}

/** `token` is used only for Spotify search, so an app (client-credentials) token works too. */
export async function generateSimilar(token: string, source: Source, size: number): Promise<GenerateResult> {
  if (!source.tracks.length) throw new UserFacingError("emptyPlaylist");

  const refs = source.tracks.map((t) => ({ artist: t.artists[0] ?? "", title: t.title }));
  const exclude = new Set(source.tracks.flatMap((t) => t.artists.map((a) => trackKey(a, t.title))));
  const sourceUris = new Set(source.tracks.map((t) => t.uri));

  const seeds = selectSeeds(refs, MAX_SEEDS);
  const lastfmLimit = pLimit(4);
  const results = (await Promise.all(seeds.map((s) => lastfmLimit(() => similarForSeed(s))))).filter(
    (r): r is SimilarResult => r !== null,
  );
  if (!results.length && seeds.length) {
    throw new UserFacingError("lastfmDown", [], 503);
  }

  // Few seeds (song mode) need a looser per-artist cap or the list stays short.
  const candidates = diversify(aggregateCandidates(results, exclude), seeds.length < 5 ? 3 : MAX_PER_ARTIST);

  // Resolve in small parallel batches and stop as soon as we have enough.
  const tracks: SuggestedTrack[] = [];
  const usedUris = new Set<string>();
  const maxTries = Math.min(candidates.length, size * 2);
  let searched = 0;
  for (let i = 0; i < maxTries && tracks.length < size; i += 5) {
    const batch = candidates.slice(i, Math.min(i + 5, maxTries));
    const hits = await Promise.all(batch.map((c) => findOnSpotify(token, c)));
    searched += batch.length;
    hits.forEach((hit, j) => {
      if (!hit || sourceUris.has(hit.uri) || usedUris.has(hit.uri) || tracks.length >= size) return;
      usedUris.add(hit.uri);
      tracks.push({
        id: hit.id,
        uri: hit.uri,
        name: hit.name,
        artists: hit.artists.map((a) => a.name),
        image: hit.album.images.at(-1)?.url ?? hit.album.images[0]?.url ?? null,
        because: batch[j].because.slice(0, 3),
      });
    });
  }

  return {
    source: { name: source.name, trackCount: source.tracks.length, partial: !!source.partial },
    tracks,
    stats: { seeds: seeds.length, candidates: candidates.length, searched },
  };
}
