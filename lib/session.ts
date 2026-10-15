import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
  userId?: string;
  displayName?: string;
  // Only set between /api/auth/login and /api/auth/callback.
  pkceVerifier?: string;
  oauthState?: string;
};

export class AuthError extends Error {}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} (see .env.example)`);
  return v;
}

export const env = {
  get clientId() {
    return requireEnv("SPOTIFY_CLIENT_ID");
  },
  get clientSecret() {
    return requireEnv("SPOTIFY_CLIENT_SECRET");
  },
  get redirectUri() {
    return requireEnv("SPOTIFY_REDIRECT_URI");
  },
  get lastfmKey() {
    return requireEnv("LASTFM_API_KEY");
  },
  get appOrigin() {
    return new URL(requireEnv("SPOTIFY_REDIRECT_URI")).origin;
  },
};

function sessionOptions(): SessionOptions {
  return {
    password: requireEnv("SESSION_SECRET"),
    cookieName: "ss_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.clientId, ...params }),
  });
  if (!res.ok) {
    throw new AuthError(`Spotify token request failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export function storeTokens(session: SessionData, t: TokenResponse) {
  session.accessToken = t.access_token;
  // Spotify may or may not rotate the refresh token.
  if (t.refresh_token) session.refreshToken = t.refresh_token;
  session.expiresAt = Date.now() + t.expires_in * 1000;
}

/** Returns a usable access token, refreshing (and persisting) it when close to expiry. */
export async function getAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session.accessToken || !session.refreshToken) throw new AuthError("Not logged in");
  if ((session.expiresAt ?? 0) - 60_000 > Date.now()) return session.accessToken;

  try {
    const t = await requestToken({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    });
    storeTokens(session, t);
    await session.save();
    return t.access_token;
  } catch (e) {
    session.destroy();
    throw e instanceof AuthError ? e : new AuthError(String(e));
  }
}

/** The logged-in user's token, or null for anonymous visitors (or an expired, unrefreshable session). */
export async function getUserTokenOrNull(): Promise<string | null> {
  try {
    return await getAccessToken();
  } catch (e) {
    if (e instanceof AuthError) return null;
    throw e;
  }
}
