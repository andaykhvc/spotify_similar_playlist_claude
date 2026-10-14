import { describe, expect, it } from "vitest";
import { normalizeArtist, normalizeTitle, parsePlaylistId, trackKey } from "./normalize";

describe("normalizeTitle", () => {
  it.each([
    ["Here Comes the Sun - Remastered 2009", "here comes the sun"],
    ["Come Together (Remastered)", "come together"],
    ["Stay (feat. Justin Bieber)", "stay"],
    ["Stay [with Justin Bieber]", "stay"],
    ["Song - feat. Someone", "song"],
    ["Wonderwall [Deluxe Edition]", "wonderwall"],
    ["Gülpembe", "gulpembe"],
    ["Işıklar", "isiklar"],
    ["Rock & Roll", "rock and roll"],
  ])("%s -> %s", (input, out) => {
    expect(normalizeTitle(input)).toBe(out);
  });

  it("keeps meaningful parentheses and dash suffixes", () => {
    expect(normalizeTitle("Song (Remix)")).toBe("song remix");
    expect(normalizeTitle("Song - Live at Wembley")).toBe("song live at wembley");
    expect(normalizeTitle("(I Can't Get No) Satisfaction")).toBe("i can t get no satisfaction");
  });
});

describe("normalizeArtist / trackKey", () => {
  it("drops leading 'The' and diacritics", () => {
    expect(normalizeArtist("The Beatles")).toBe("beatles");
    expect(normalizeArtist("Sezen Aksu")).toBe(normalizeArtist("SEZEN AKSU"));
    expect(normalizeArtist("Beyoncé")).toBe("beyonce");
  });

  it("matches the same song across catalog spellings", () => {
    expect(trackKey("The Beatles", "Let It Be - Remastered 2009")).toBe(trackKey("Beatles", "Let It Be"));
  });
});

describe("parsePlaylistId", () => {
  const id = "37i9dQZF1DXcBWIGoYBM5M";
  it.each([
    [`https://open.spotify.com/playlist/${id}?si=abc`],
    [`https://open.spotify.com/intl-tr/playlist/${id}`],
    [`spotify:playlist:${id}`],
    [id],
  ])("parses %s", (input) => {
    expect(parsePlaylistId(input)).toBe(id);
  });

  it("rejects non-playlist input", () => {
    expect(parsePlaylistId("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC")).toBeNull();
    expect(parsePlaylistId("hello")).toBeNull();
  });
});
