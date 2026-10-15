import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";
import { fetchProfile } from "@/lib/embed";
import { UserFacingError } from "@/lib/errors";
import { parseSpotifyLink } from "@/lib/normalize";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { getUserTokenOrNull } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const link = parseSpotifyLink(req.nextUrl.searchParams.get("u") ?? "");
    if (link?.kind !== "user") throw new UserFacingError("Geçerli bir Spotify profil linki gir.");
    if (!(await getUserTokenOrNull())) rateLimit("profile", clientIp(req), 20, 10 * 60_000);
    return NextResponse.json(await fetchProfile(link.id));
  } catch (e) {
    return errorResponse(e);
  }
}
