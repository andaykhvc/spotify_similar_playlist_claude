// Reads a playlist without any Spotify login via the public embed player page.
// Not an official API: it returns only the first ~50 tracks and may break if Spotify
// changes the page. Used for anonymous users and for playlists the dev-mode Web API
// refuses to read (anything the user doesn't own).
import { UserFacingError } from "./errors";
import type { SourceTrack } from "./spotify";

export type EmbedPlaylist = { name: string; tracks: SourceTrack[] };

type EmbedTrack = { uri?: string; title?: string; subtitle?: string };

export function parseEmbedHtml(html: string): EmbedPlaylist | null {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return null;
  let entity: { name?: string; title?: string; trackList?: EmbedTrack[] } | undefined;
  try {
    entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
  } catch {
    return null;
  }
  if (!entity || !Array.isArray(entity.trackList)) return null;

  const tracks = entity.trackList
    .filter((t) => t.uri?.startsWith("spotify:track:") && t.title && t.subtitle)
    .map((t) => ({
      uri: t.uri!,
      title: t.title!,
      // Artists come joined as one display string ("A, B"); good enough for Last.fm lookups.
      artists: t.subtitle!.split(/,\s+/).filter(Boolean),
    }));
  return { name: entity.name ?? entity.title ?? "Playlist", tracks };
}

export async function fetchEmbedPlaylist(id: string): Promise<EmbedPlaylist> {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${id}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; echo-list/0.1)", "Accept-Language": "en" },
  });
  const parsed = res.ok ? parseEmbedHtml(await res.text()) : null;
  if (!parsed || !parsed.tracks.length) {
    throw new UserFacingError(
      res.status === 404
        ? "Bu playlist bulunamadı. Linkin doğru ve playlist'in herkese açık olduğundan emin ol."
        : "Bu playlist şu an okunamadı. Gizli olabilir; 'Şarkılar' sekmesinden birkaç şarkı seçerek dene.",
    );
  }
  return parsed;
}

// ── Public profiles ──
// The profile page ships its first render state as base64 JSON in <script id="initialState">.
// Same caveats as the embed page: unofficial, and it lists only the first ~10 public playlists.

export type ProfilePlaylist = { id: string; name: string; image: string | null };
export type Profile = { name: string; playlists: ProfilePlaylist[]; total: number };

type RawPlaylist = {
  _uri?: string;
  data?: { name?: string; uri?: string; images?: { items?: { sources?: { url?: string }[] }[] } };
};

export function parseProfileHtml(html: string): Profile | null {
  const m = html.match(/<script id="initialState" type="[^"]*">([^<]+)<\/script>/);
  if (!m) return null;
  let state: { entities?: { items?: Record<string, unknown> } };
  try {
    state = JSON.parse(Buffer.from(m[1].trim(), "base64").toString("utf8"));
  } catch {
    return null;
  }
  type RawUser = { __typename?: string; name?: string; publicPlaylistsV2?: { items?: RawPlaylist[]; totalCount?: number } };
  const user = Object.values(state.entities?.items ?? {}).find(
    (v): v is RawUser => (v as RawUser)?.__typename === "User" && !!(v as RawUser).publicPlaylistsV2,
  );
  if (!user) return null;

  const playlists: ProfilePlaylist[] = [];
  for (const p of user.publicPlaylistsV2?.items ?? []) {
    const id = (p.data?.uri ?? p._uri ?? "").match(/^spotify:playlist:([A-Za-z0-9]{22})$/)?.[1];
    if (!id || !p.data?.name) continue;
    playlists.push({ id, name: p.data.name, image: p.data.images?.items?.[0]?.sources?.[0]?.url ?? null });
  }
  return {
    name: user.name ?? "Bu kullanıcı",
    playlists,
    total: Math.max(user.publicPlaylistsV2?.totalCount ?? 0, playlists.length),
  };
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const res = await fetch(`https://open.spotify.com/user/${encodeURIComponent(userId)}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; echo-list/0.1)", "Accept-Language": "en" },
  });
  if (res.status === 404) throw new UserFacingError("Bu Spotify profili bulunamadı. Linki kontrol et.");
  const profile = res.ok ? parseProfileHtml(await res.text()) : null;
  if (!profile) {
    throw new UserFacingError("Bu profil şu an okunamadı. Profilden bir playlist açıp onun linkini yapıştırmayı dene.");
  }
  if (!profile.playlists.length) {
    throw new UserFacingError(`${profile.name} profilinde herkese açık playlist yok.`);
  }
  return profile;
}
