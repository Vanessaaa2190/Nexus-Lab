import { NextRequest, NextResponse } from "next/server";
import { buildLoginUrl } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const url = buildLoginUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 600 });
  return res;
}
