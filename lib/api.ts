import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { UserFacingError } from "./errors";
import { AuthError } from "./session";
import { SpotifyError } from "./spotify";

/** Maps thrown errors to `{ error: code, params }`; the client localizes the code. */
export function errorResponse(e: unknown) {
  // Let Next.js see its own control-flow errors (e.g. cookies() bailing out of prerendering).
  unstable_rethrow(e);
  if (e instanceof AuthError || (e instanceof SpotifyError && e.status === 401)) {
    return NextResponse.json({ error: "sessionExpired", auth: true }, { status: 401 });
  }
  if (e instanceof UserFacingError) {
    return NextResponse.json({ error: e.code, params: e.params }, { status: e.status });
  }
  if (e instanceof SpotifyError && e.status === 429) {
    return NextResponse.json({ error: "spotifyBusy" }, { status: 429 });
  }
  console.error(e);
  return NextResponse.json({ error: "generic" }, { status: 500 });
}
