import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";
import { generateSimilar, resolvePlaylist, UserFacingError, type Source } from "@/lib/generate";
import { linkHint, parseSpotifyLink } from "@/lib/normalize";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { getUserTokenOrNull } from "@/lib/session";
import { getAppToken, type SourceTrack } from "@/lib/spotify";

export const maxDuration = 120;

const TRACK_URI = /^spotify:track:[A-Za-z0-9]{22}$/;
const MAX_SEED_SONGS = 10;

function parseSeeds(raw: unknown): SourceTrack[] {
  if (!Array.isArray(raw) || !raw.length || raw.length > MAX_SEED_SONGS) {
    throw new UserFacingError("seedCount", [MAX_SEED_SONGS]);
  }
  return raw.map((s) => {
    const uri = String(s?.uri ?? "");
    const title = String(s?.title ?? "").slice(0, 200);
    const artists = Array.isArray(s?.artists) ? s.artists.slice(0, 10).map((a: unknown) => String(a).slice(0, 200)) : [];
    if (!TRACK_URI.test(uri) || !title || !artists.length) throw new UserFacingError("seedsInvalid");
    return { uri, title, artists };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const size = Math.min(100, Math.max(10, Math.round(Number(body.size) || 30)));
    const userToken = await getUserTokenOrNull();
    if (!userToken) rateLimit("similar", clientIp(req), 6, 10 * 60_000);

    let source: Source;
    if (body.seeds !== undefined) {
      const tracks = parseSeeds(body.seeds);
      source = { name: tracks.map((t) => t.title).slice(0, 3).join(", "), tracks };
    } else {
      const link = parseSpotifyLink(String(body.playlist ?? ""));
      if (link?.kind !== "playlist") throw new UserFacingError(linkHint(link?.kind));
      const playlistId = link.id;
      source = await resolvePlaylist(userToken, playlistId);
    }

    const token = userToken ?? (await getAppToken());
    return NextResponse.json(await generateSimilar(token, source, size));
  } catch (e) {
    return errorResponse(e);
  }
}
