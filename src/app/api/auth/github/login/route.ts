import { NextRequest, NextResponse } from "next/server";
import { buildGithubLoginUrl } from "@/lib/auth";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const state = randomBytes(16).toString("hex");

  const fallbackRedirectUri = `${req.nextUrl.origin}/api/auth/github/callback`;
  const url = buildGithubLoginUrl(state, fallbackRedirectUri);

  const res = NextResponse.redirect(url);

  res.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
  });

  return res;
}
