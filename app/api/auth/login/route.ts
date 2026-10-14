import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env, getSession } from "@/lib/session";

const SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-private",
].join(" ");

export async function GET(req: NextRequest) {
  // The session cookie must live on the same origin as the redirect URI
  // (e.g. 127.0.0.1 vs localhost), otherwise the state check fails on callback.
  // (nextUrl normalises the dev host to "localhost", so compare the raw Host header.)
  if (req.headers.get("host") !== new URL(env.appOrigin).host) {
    return NextResponse.redirect(new URL("/api/auth/login", env.appOrigin));
  }

  const verifier = randomBytes(48).toString("base64url");
  const state = randomBytes(16).toString("base64url");
  const session = await getSession();
  session.pkceVerifier = verifier;
  session.oauthState = state;
  await session.save();

  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    client_id: env.clientId,
    response_type: "code",
    redirect_uri: env.redirectUri,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
  }).toString();
  return NextResponse.redirect(url);
}
