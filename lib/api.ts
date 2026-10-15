import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { UserFacingError } from "./errors";
import { AuthError } from "./session";
import { SpotifyError } from "./spotify";

/** Maps thrown errors to JSON responses the client can show as-is. */
export function errorResponse(e: unknown) {
  // Let Next.js see its own control-flow errors (e.g. cookies() bailing out of prerendering).
  unstable_rethrow(e);
  if (e instanceof AuthError || (e instanceof SpotifyError && e.status === 401)) {
    return NextResponse.json({ error: "Oturumun düştü, tekrar giriş yap.", auth: true }, { status: 401 });
  }
  if (e instanceof UserFacingError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof SpotifyError && e.status === 429) {
    return NextResponse.json({ error: "Spotify istek sınırına takıldık, bir dakika sonra tekrar dene." }, { status: 429 });
  }
  console.error(e);
  return NextResponse.json({ error: "Bir şeyler ters gitti, tekrar dene." }, { status: 500 });
}
