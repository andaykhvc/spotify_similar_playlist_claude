// Version tags that don't change which song it is ("- Remastered 2011", "(Mono)", "[Deluxe Edition]").
const VERSION_WORDS =
  /\b(remaster(ed)?|mono|stereo|deluxe|edition|version|anniversary|bonus|single|album|explicit|clean|radio edit)\b/;

// Words that make it a different recording; such tags are never stripped.
export const ALT_TAKE = /\b(remix|live|acoustic|instrumental|karaoke|demo|cover|sped up|slowed)\b/;

const isVersionTag = (s: string) => VERSION_WORDS.test(s) && !ALT_TAKE.test(s);

function baseNormalize(s: string): string {
  return s
    .toLocaleLowerCase("en")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ");
}

function squash(s: string): string {
  return s
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTitle(title: string): string {
  let t = baseNormalize(title);
  // "(feat. X)" / "[with X]" / " - feat. X"
  t = t.replace(/[([](feat|ft|featuring|with)\.?\s[^)\]]*[)\]]/g, " ");
  t = t.replace(/\s-\s(feat|ft|featuring)\.?\s.*$/, " ");
  // Parenthesised / bracketed version tags.
  t = t.replace(/[([]([^)\]]*)[)\]]/g, (m, inner: string) => (isVersionTag(inner) ? " " : m));
  // Trailing " - Remastered 2009" style suffixes.
  t = t.replace(/\s-\s([^-]*)$/, (m, tail: string) => (isVersionTag(tail) ? " " : m));
  return squash(t);
}

export function normalizeArtist(artist: string): string {
  return squash(baseNormalize(artist).replace(/^the\s+/, ""));
}

export function trackKey(artist: string, title: string): string {
  return `${normalizeArtist(artist)}|${normalizeTitle(title)}`;
}

export type SpotifyLinkKind = "playlist" | "user" | "track" | "album" | "artist";
export type SpotifyLink = { kind: SpotifyLinkKind; id: string };

const BASE62_ID = /^[A-Za-z0-9]{22}$/;
// Usernames can be legacy handles ("wizzler") or generated ids; keep them to a safe charset.
const USER_ID = /^[A-Za-z0-9._-]{1,64}$/;

/** Recognises open.spotify.com links (any locale prefix, embed or not), spotify: URIs and bare playlist ids. */
export function parseSpotifyLink(input: string): SpotifyLink | null {
  const s = input.trim();
  const m =
    s.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|user|track|album|artist)\/([^/?#\s]+)/i) ??
    s.match(/^spotify:(playlist|user|track|album|artist):([^:\s]+)$/i);
  if (m) {
    const kind = m[1].toLowerCase() as SpotifyLinkKind;
    let id = m[2];
    try {
      id = decodeURIComponent(id);
    } catch {
      return null;
    }
    const ok = kind === "user" ? USER_ID.test(id) : BASE62_ID.test(id);
    return ok ? { kind, id } : null;
  }
  return BASE62_ID.test(s) ? { kind: "playlist", id: s } : null;
}

export function parsePlaylistId(input: string): string | null {
  const link = parseSpotifyLink(input);
  return link?.kind === "playlist" ? link.id : null;
}

/** What to tell someone who pasted a Spotify link we can't start from. */
export function linkHint(kind: SpotifyLinkKind | undefined): string {
  switch (kind) {
    case "track":
      return "Bu bir şarkı linki. Şarkılar sekmesinden bu şarkıyı arayıp seçebilirsin.";
    case "album":
    case "artist":
      return "Bu bir albüm ya da sanatçı linki. Bir playlist linki yapıştır ya da Şarkılar sekmesinden şarkı seç.";
    case "user":
      return "Bu bir profil linki. Profildeki playlist'lerden birini seç.";
    default:
      return "Geçerli bir Spotify playlist ya da profil linki gir.";
  }
}
