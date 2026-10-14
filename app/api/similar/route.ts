import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";
import { generateSimilar, UserFacingError } from "@/lib/generate";
import { parsePlaylistId } from "@/lib/normalize";
import { getAccessToken } from "@/lib/session";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const playlistId = parsePlaylistId(String(body.playlist ?? ""));
    if (!playlistId) throw new UserFacingError("Geçerli bir Spotify playlist linki ya da ID'si gir.");
    const size = Math.min(100, Math.max(10, Math.round(Number(body.size) || 30)));

    const token = await getAccessToken();
    return NextResponse.json(await generateSimilar(token, playlistId, size));
  } catch (e) {
    return errorResponse(e);
  }
}
