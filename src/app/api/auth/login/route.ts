import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function homeUrl(req: NextRequest): URL {
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : process.env.GITHUB_REDIRECT_URI
      ? new URL(process.env.GITHUB_REDIRECT_URI).origin
      : req.nextUrl.origin;

  return new URL("/", appOrigin);
}

export async function GET(req: NextRequest) {
  return NextResponse.redirect(homeUrl(req));
}
