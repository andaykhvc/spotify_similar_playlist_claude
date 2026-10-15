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
