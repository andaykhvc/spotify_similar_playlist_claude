import { describe, expect, it } from "vitest";
import { normalizeArtist, trackKey } from "./normalize";
import { aggregateCandidates, diversify, pickSpotifyMatch, selectSeeds, type SimilarResult } from "./similar";

const t = (artist: string, title: string) => ({ artist, title });

describe("selectSeeds", () => {
  it("spreads seeds across artists before repeating one", () => {
    const tracks = [
      ...Array.from({ length: 10 }, (_, i) => t("A", `a${i}`)),
      t("B", "b1"),
      t("C", "c1"),
    ];
    const seeds = selectSeeds(tracks, 3, () => 0.5);
    expect(new Set(seeds.map((s) => s.artist))).toEqual(new Set(["A", "B", "C"]));
  });

  it("collapses duplicate songs and respects max", () => {
    const tracks = [t("A", "Song"), t("A", "Song - Remastered"), t("B", "x"), t("B", "y")];
    expect(selectSeeds(tracks, 10)).toHaveLength(3);
    expect(selectSeeds(tracks, 2)).toHaveLength(2);
  });
});

describe("aggregateCandidates", () => {
  const results: SimilarResult[] = [
    {
      seed: t("A", "seed1"),
      weight: 1,
      tracks: [
        { ...t("X", "shared"), match: 0.5 },
        { ...t("Y", "only1"), match: 0.9 },
        { ...t("A", "seed2"), match: 1 }, // already in the playlist
      ],
    },
    {
      seed: t("B", "seed2"),
      weight: 1,
      tracks: [{ ...t("X", "Shared (Remastered)"), match: 0.6 }],
    },
    {
      seed: t("C", "seed3"),
      weight: 0.5,
      tracks: [{ ...t("Z", "fallback"), match: 1 }],
    },
  ];
  const exclude = new Set([trackKey("A", "seed1"), trackKey("A", "seed2"), trackKey("C", "seed3")]);

  it("sums scores across seeds, excludes source songs, ranks by score", () => {
    const out = aggregateCandidates(results, exclude);
    expect(out.map((c) => c.title)).toEqual(["shared", "only1", "fallback"]);
    expect(out[0].score).toBeCloseTo(1.1);
    expect(out[0].because).toEqual(["seed2", "seed1"]);
    expect(out[2].score).toBeCloseTo(0.5);
  });
});

describe("diversify", () => {
  it("caps songs per artist and keeps order", () => {
    const items = [t("A", "1"), t("The A", "2"), t("B", "1"), t("a", "3"), t("B", "2")];
    const out = diversify(items, 2);
    expect(out.map((i) => `${i.artist}-${i.title}`)).toEqual(["A-1", "The A-2", "B-1", "B-2"]);
    expect(out.filter((i) => normalizeArtist(i.artist) === "a")).toHaveLength(2);
  });
});

describe("pickSpotifyMatch", () => {
  const hit = (name: string, ...artists: string[]) => ({ name, artists: artists.map((n) => ({ name: n })) });

  it("prefers exact normalized matches", () => {
    const hits = [hit("Song (Live)", "X"), hit("Song - 2011 Remaster", "X")];
    expect(pickSpotifyMatch(t("X", "Song"), hits)).toBe(hits[1]);
  });

  it("accepts a featured artist and suffix variants", () => {
    const h = hit("Song - From the Movie", "Y", "X");
    expect(pickSpotifyMatch(t("X", "Song"), [h])).toBe(h);
  });

  it("rejects wrong artist or alternate takes", () => {
    expect(pickSpotifyMatch(t("X", "Song"), [hit("Song", "Other")])).toBeNull();
    expect(pickSpotifyMatch(t("X", "Song"), [hit("Song - Acoustic Version", "X")])).toBeNull();
    expect(pickSpotifyMatch(t("X", "Song"), [hit("Song Remix", "X")])).toBeNull();
  });
});
