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

export function parsePlaylistId(input: string): string | null {
  const s = input.trim();
  const m =
    s.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?playlist\/([A-Za-z0-9]{22})/) ??
    s.match(/^spotify:playlist:([A-Za-z0-9]{22})$/) ??
    s.match(/^([A-Za-z0-9]{22})$/);
  return m ? m[1] : null;
}
