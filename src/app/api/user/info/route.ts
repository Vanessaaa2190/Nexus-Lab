import { NextRequest, NextResponse } from "next/server";
import { getSession, fetchUserInfo, refreshAccessToken, sessionToCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let session = getSession(req.headers.get("cookie") ?? null);
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
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
      res.headers.append("Set-Cookie", sessionToCookie(session));
    }
    return res;
  } catch (e) {
    console.error("User info error:", e);
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 502 });
  }
}
