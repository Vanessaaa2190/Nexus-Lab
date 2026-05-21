import { NextRequest, NextResponse } from "next/server";
import { exchangeGithubCodeForToken, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("github_oauth_state")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }
  if (state !== savedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }

  try {
    const accessToken = await exchangeGithubCodeForToken(code);
    const session = {
      provider: "github" as const,
      accessToken,
      refreshToken: "",
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    setSessionCookie(res, session);
    res.cookies.delete("github_oauth_state");
    return res;
  } catch (e) {
    console.error("GitHub OAuth callback error:", e);
    return NextResponse.redirect(new URL("/?error=token_exchange", req.url));
  }
}

