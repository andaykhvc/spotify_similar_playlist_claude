import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";
import { UserFacingError } from "@/lib/generate";
import { getAccessToken } from "@/lib/session";
import { createPlaylistWithTracks } from "@/lib/spotify";

const TRACK_URI = /^spotify:track:[A-Za-z0-9]{22}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 100);
    const uris: unknown[] = Array.isArray(body.uris) ? body.uris : [];
    if (!name) throw new UserFacingError("Playlist'e bir isim ver.");
    if (!uris.length || uris.length > 100 || !uris.every((u) => typeof u === "string" && TRACK_URI.test(u))) {
      throw new UserFacingError("Kaydedilecek şarkı listesi geçersiz.");
    }
    const description = String(body.description ?? "").slice(0, 300);

    const token = await getAccessToken();
    const playlist = await createPlaylistWithTracks(token, name, description, uris as string[]);
    return NextResponse.json(playlist);
  } catch (e) {
    return errorResponse(e);
  }
}
