import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, sessionToCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("oauth_state")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }
  if (state !== savedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }

  try {
    const session = await exchangeCodeForToken(code);
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.headers.append("Set-Cookie", sessionToCookie(session));
    res.cookies.delete("oauth_state");
    return res;
  } catch (e) {
    console.error("OAuth callback error:", e);
    return NextResponse.redirect(new URL("/?error=token_exchange", req.url));
  }
}
