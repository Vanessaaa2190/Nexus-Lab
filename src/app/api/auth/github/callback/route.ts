import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGithubCodeForToken,
  fetchGithubUserInfo,
  sessionToCookie,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

function redirectUrl(req: NextRequest, path: string): URL {
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : process.env.GITHUB_REDIRECT_URI
      ? new URL(process.env.GITHUB_REDIRECT_URI).origin
      : req.nextUrl.origin;

  return new URL(path, appOrigin);
}

function githubRedirectUri(req: NextRequest): string {
  return (
    process.env.GITHUB_REDIRECT_URI ??
    redirectUrl(req, "/api/auth/github/callback").toString()
  );
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("github_oauth_state")?.value;

  if (!code) {
    return NextResponse.redirect(redirectUrl(req, "/?error=no_code"));
  }
  if (state !== savedState) {
    return NextResponse.redirect(redirectUrl(req, "/?error=invalid_state"));
  }

  try {
    const accessToken = await exchangeGithubCodeForToken(
      code,
      githubRedirectUri(req)
    );
    const user = await fetchGithubUserInfo(accessToken);
    const session = {
      provider: "github" as const,
      accessToken,
      refreshToken: "",
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      user,
    };
    const res = NextResponse.redirect(redirectUrl(req, "/dashboard"));
    res.headers.append("Set-Cookie", sessionToCookie(session));
    res.cookies.delete("github_oauth_state");
    return res;
  } catch (e) {
    console.error("GitHub OAuth callback error:", e);
    return NextResponse.redirect(redirectUrl(req, "/?error=token_exchange"));
  }
}
