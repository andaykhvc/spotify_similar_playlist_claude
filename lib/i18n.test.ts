import { describe, expect, it } from "vitest";
import { errorText, messages } from "./i18n";
import { linkHint } from "./normalize";

describe("i18n", () => {
  const { en, tr } = messages;

  it("Turkish mirrors every English key", () => {
    expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(tr.errors).sort()).toEqual(Object.keys(en.errors).sort());
  });

  it("renders every error code in both languages", () => {
    for (const code of Object.keys(en.errors)) {
      for (const lang of ["en", "tr"] as const) {
        const text = errorText(lang, code, [5]);
        expect(text.length, `${lang}.${code}`).toBeGreaterThan(5);
        expect(text).not.toContain("undefined");
      }
    }
  });

  it("falls back to the generic error for unknown codes", () => {
    expect(errorText("en", "nope")).toBe(en.errors.generic());
    expect(errorText("tr", undefined)).toBe(tr.errors.generic());
  });

  it("interpolates params", () => {
    expect(errorText("en", "rateLimited", [3])).toContain("3 minutes");
    expect(errorText("tr", "rateLimited", [3])).toContain("3 dakika");
    expect(errorText("en", "profileNoPlaylists", [""])).toBe("This profile has no public playlists.");
  });

  it("every link hint is a real error code", () => {
    for (const kind of ["track", "album", "artist", "user", undefined] as const) {
      expect(Object.keys(en.errors)).toContain(linkHint(kind));
    }
  });
});
