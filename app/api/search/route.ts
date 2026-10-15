import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { getUserTokenOrNull } from "@/lib/session";
import { getAppToken, searchTracks } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
    if (q.length < 2) return NextResponse.json({ tracks: [] });
    const userToken = await getUserTokenOrNull();
    if (!userToken) rateLimit("search", clientIp(req), 60, 60_000);

    const results = await searchTracks(userToken ?? (await getAppToken()), q, 10);
    return NextResponse.json({
      tracks: results.map((t) => ({
        uri: t.uri,
        id: t.id,
        title: t.name,
        artists: t.artists.map((a) => a.name),
        image: t.album.images.at(-1)?.url ?? null,
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
