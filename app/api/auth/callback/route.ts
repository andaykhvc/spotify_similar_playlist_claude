import { NextResponse, type NextRequest } from "next/server";
import { env, getSession, requestToken, storeTokens } from "@/lib/session";
import { getMe } from "@/lib/spotify";

function backHome(error?: string) {
  const url = new URL("/", env.appOrigin);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const session = await getSession();
  const { pkceVerifier, oauthState } = session;
  session.pkceVerifier = undefined;
  session.oauthState = undefined;

  if (params.get("error")) {
    await session.save();
    return backHome(params.get("error") === "access_denied" ? "denied" : "spotify");
  }
  const code = params.get("code");
  if (!code || !pkceVerifier || params.get("state") !== oauthState) {
    await session.save();
    return backHome("state");
  }

  try {
    const tokens = await requestToken({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.redirectUri,
      code_verifier: pkceVerifier,
    });
    storeTokens(session, tokens);
    const me = await getMe(tokens.access_token);
    session.userId = me.id;
    session.displayName = me.display_name ?? me.id;
    await session.save();
    return backHome();
  } catch (e) {
    console.error("[auth] callback failed:", e);
    session.destroy();
    // Dev-mode apps reject users that aren't on the app's allowlist with a 403 here.
    return backHome("login");
  }
}
