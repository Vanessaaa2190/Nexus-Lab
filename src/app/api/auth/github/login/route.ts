import { NextRequest, NextResponse } from "next/server";
import { buildGithubLoginUrl } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/github/callback", req.url).toString();
  const url = buildGithubLoginUrl(state, redirectUri);
  const res = NextResponse.redirect(url);
  res.cookies.set("github_oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 600 });
  return res;
}

