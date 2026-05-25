import { NextRequest, NextResponse } from "next/server";
import {
  fetchGithubUserInfo,
  fetchUserInfo,
  getSession,
  refreshAccessToken,
  sessionCookieOptions,
  sessionCookieValue,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  let session = getSession(req.headers.get("cookie") ?? null);
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  if (session.provider === "github") {
    try {
      const user = session.user ?? (await fetchGithubUserInfo(session.accessToken));
      const res = NextResponse.json(user);
      if (!session.user) {
        session = { ...session, user };
        res.cookies.set(
          SESSION_COOKIE_NAME,
          sessionCookieValue(session),
          sessionCookieOptions()
        );
      }
      return res;
    } catch (e) {
      console.error("GitHub user info error:", e);
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 502 });
    }
  }
  if (session.expiresAt && Date.now() > session.expiresAt - 60_000) {
    try {
      session = await refreshAccessToken(session.refreshToken);
    } catch {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }
  }
  try {
    const user = await fetchUserInfo(session.accessToken);
    const res = NextResponse.json(user);
    if (session !== getSession(req.headers.get("cookie") ?? null)) {
      res.cookies.set(
        SESSION_COOKIE_NAME,
        sessionCookieValue(session),
        sessionCookieOptions()
      );
    }
    return res;
  } catch (e) {
    console.error("User info error:", e);
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 502 });
  }
}
