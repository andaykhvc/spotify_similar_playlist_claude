import { describe, expect, it } from "vitest";
import { parseEmbedHtml, parseProfileHtml } from "./embed";

const page = (data: unknown) =>
  `<html><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
    data,
  )}</script></body></html>`;

const entity = (trackList: unknown[]) => ({
  props: { pageProps: { state: { data: { entity: { name: "Yol Şarkıları", trackList } } } } },
});

describe("parseEmbedHtml", () => {
  it("extracts playlist name and tracks, splitting multi-artist subtitles", () => {
    const html = page(
      entity([
        { uri: "spotify:track:aaaaaaaaaaaaaaaaaaaaaa", title: "Song A", subtitle: "Artist One" },
        { uri: "spotify:track:bbbbbbbbbbbbbbbbbbbbbb", title: "Song B", subtitle: "X, Y & Z, W" },
      ]),
    );
    expect(parseEmbedHtml(html)).toEqual({
      name: "Yol Şarkıları",
      tracks: [
        { uri: "spotify:track:aaaaaaaaaaaaaaaaaaaaaa", title: "Song A", artists: ["Artist One"] },
        { uri: "spotify:track:bbbbbbbbbbbbbbbbbbbbbb", title: "Song B", artists: ["X", "Y & Z", "W"] },
      ],
    });
  });

  it("skips episodes and incomplete entries", () => {
    const html = page(
      entity([
        { uri: "spotify:episode:cccccccccccccccccccccc", title: "Podcast", subtitle: "Show" },
        { uri: "spotify:track:dddddddddddddddddddddd", title: "", subtitle: "Nobody" },
        { uri: "spotify:track:eeeeeeeeeeeeeeeeeeeeee", title: "Keep", subtitle: "Me" },
      ]),
    );
    expect(parseEmbedHtml(html)?.tracks.map((t) => t.title)).toEqual(["Keep"]);
  });

  it("returns null when the page shape is unknown", () => {
    expect(parseEmbedHtml("<html>nope</html>")).toBeNull();
    expect(parseEmbedHtml(page({ props: {} }))).toBeNull();
    expect(
      parseEmbedHtml('<script id="__NEXT_DATA__" type="application/json">{broken</script>'),
    ).toBeNull();
  });
});

describe("parseProfileHtml", () => {
  const page = (state: unknown) =>
    `<html><script id="initialState" type="text/plain">${Buffer.from(JSON.stringify(state)).toString("base64")}</script></html>`;
  const playlist = (id: string, name: string, image?: string) => ({
    _uri: `spotify:playlist:${id}`,
    data: { name, uri: `spotify:playlist:${id}`, images: { items: image ? [{ sources: [{ url: image }] }] : [] } },
  });

  it("reads the user's name and public playlists", () => {
    const html = page({
      entities: {
        items: {
          "spotify:user:wizzler": {
            __typename: "User",
            name: "Ronald",
            publicPlaylistsV2: {
              totalCount: 42,
              items: [playlist("aaaaaaaaaaaaaaaaaaaaaa", "Yol", "https://i.scdn.co/x"), playlist("bbbbbbbbbbbbbbbbbbbbbb", "Gece")],
            },
          },
        },
      },
    });
    expect(parseProfileHtml(html)).toEqual({
      name: "Ronald",
      total: 42,
      playlists: [
        { id: "aaaaaaaaaaaaaaaaaaaaaa", name: "Yol", image: "https://i.scdn.co/x" },
        { id: "bbbbbbbbbbbbbbbbbbbbbb", name: "Gece", image: null },
      ],
    });
  });

  it("returns null when the page shape is unknown", () => {
    expect(parseProfileHtml("<html></html>")).toBeNull();
    expect(parseProfileHtml('<script id="initialState" type="text/plain">!!!</script>')).toBeNull();
    expect(parseProfileHtml(page({ entities: { items: {} } }))).toBeNull();
  });
});
