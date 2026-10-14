// Targets the post-February-2026 Web API for Development Mode apps:
// /playlists/{id}/items (not /tracks), POST /me/playlists, search limit <= 10,
// and playlist contents are only readable for playlists the user owns or collaborates on.

const API = "https://api.spotify.com/v1";

export class SpotifyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function spotifyFetch<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    if (res.status === 429 && attempt < 3) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
      await sleep(Math.min(Math.max(retryAfter, 1), 10) * 1000);
      continue;
    }
    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = await res.json();
        message = body?.error?.message ?? message;
      } catch {}
      throw new SpotifyError(res.status, message);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  }
}

type Image = { url: string; width: number | null; height: number | null };

export type SpotifyTrack = {
  type: "track";
  id: string;
  uri: string;
  name: string;
  is_local?: boolean;
  artists: { id: string; name: string }[];
  album: { name: string; images: Image[] };
};

type Paging<T> = { items: T[]; next: string | null; total: number };

export type PlaylistSummary = {
  id: string;
  name: string;
  collaborative: boolean;
  owner: { id: string; display_name?: string };
  images: Image[] | null;
  items?: { total: number };
};

export function getMe(token: string) {
  return spotifyFetch<{ id: string; display_name?: string }>(token, "/me");
}

export async function getMyPlaylists(token: string, max = 200): Promise<PlaylistSummary[]> {
  const out: PlaylistSummary[] = [];
  let next: string | null = "/me/playlists?limit=50";
  while (next && out.length < max) {
    const page: Paging<PlaylistSummary | null> = await spotifyFetch(token, next);
    for (const p of page.items) if (p) out.push(p);
    next = page.next;
  }
  return out;
}

export function getPlaylistMeta(token: string, id: string) {
  return spotifyFetch<PlaylistSummary>(token, `/playlists/${id}?fields=id,name,collaborative,owner(id),images`);
}

type PlaylistItem = { is_local: boolean; item: SpotifyTrack | { type: "episode" } | null };

export async function getPlaylistTracks(token: string, id: string, max = 1000): Promise<SpotifyTrack[]> {
  const out: SpotifyTrack[] = [];
  let next: string | null = `/playlists/${id}/items?limit=50&additional_types=track`;
  while (next && out.length < max) {
    const page: Paging<PlaylistItem> = await spotifyFetch(token, next);
    for (const it of page.items) {
      if (!it.is_local && it.item?.type === "track") out.push(it.item);
    }
    next = page.next;
  }
  return out;
}

export async function searchTracks(token: string, query: string, limit = 5): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({ q: query, type: "track", limit: String(limit) });
  const res = await spotifyFetch<{ tracks: Paging<SpotifyTrack | null> }>(token, `/search?${params}`);
  return res.tracks.items.filter((t): t is SpotifyTrack => t !== null);
}

export async function createPlaylistWithTracks(
  token: string,
  name: string,
  description: string,
  uris: string[],
): Promise<{ id: string; url: string }> {
  const pl = await spotifyFetch<{ id: string; external_urls: { spotify: string } }>(token, "/me/playlists", {
    method: "POST",
    body: JSON.stringify({ name, description, public: false }),
  });
  for (let i = 0; i < uris.length; i += 100) {
    await spotifyFetch(token, `/playlists/${pl.id}/items`, {
      method: "POST",
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
  }
  return { id: pl.id, url: pl.external_urls.spotify };
}
