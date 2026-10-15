import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { getAccessToken, getSession } from "@/lib/session";
import { getMyPlaylists } from "@/lib/spotify";

export async function GET() {
  try {
    const token = await getAccessToken();
    const { userId } = await getSession();
    const playlists = await getMyPlaylists(token);
    return NextResponse.json({
      playlists: playlists.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.url ?? null,
        total: p.items?.total ?? null,
        owner: p.owner.display_name ?? p.owner.id,
        // Dev-mode apps can only read items of playlists the user owns or collaborates on;
        // the rest are read from the embed page, which caps at ~50 tracks.
        fullAccess: p.owner.id === userId || p.collaborative,
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
