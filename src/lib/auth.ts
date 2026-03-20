/**
 * Second Me OAuth 会话与 API 基础
 * API 文档: https://develop-docs.second.me/zh/docs/api-reference/secondme
 */

const API_BASE = process.env.SECONDME_API_BASE_URL ?? "https://api.mindverse.com/gate/lab";
const OAUTH_URL = process.env.SECONDME_OAUTH_URL ?? "https://go.second.me/oauth/";
const COOKIE_NAME = "nexuslab_session";

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserInfo {
  id?: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  avatarUrl?: string;
  route?: string;
  email?: string;
  shades?: Array<{ id?: string; name?: string }>;
}

function getCookieHeader(cookieHeader: string | null): SessionData | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as SessionData;
  } catch {
    return null;
  }
}

export function getSession(cookieHeader: string | null): SessionData | null {
  const data = getCookieHeader(cookieHeader);
  if (!data?.accessToken) return null;
  if (data.expiresAt && Date.now() > data.expiresAt - 60_000) {
    return null;
  }
  return data;
}

export function buildLoginUrl(state: string): string {
  const clientId = process.env.SECONDME_CLIENT_ID;
  const redirectUri = process.env.SECONDME_REDIRECT_URI;
  if (!clientId || !redirectUri) throw new Error("Missing SECONDME_CLIENT_ID or SECONDME_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `${OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<SessionData> {
  const res = await fetch(`${API_BASE}/api/oauth/token/code`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  });
  const json = await res.json();
  if (json.code !== 0 || !json.data?.accessToken) {
    throw new Error(json.message ?? "Token exchange failed");
  }
  const { accessToken, refreshToken, expiresIn } = json.data;
  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + (expiresIn ?? 7200) * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<SessionData> {
  const res = await fetch(`${API_BASE}/api/oauth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  });
  const json = await res.json();
  if (json.code !== 0 || !json.data?.accessToken) {
    throw new Error(json.message ?? "Refresh failed");
  }
  const { accessToken, refreshToken: newRefresh, expiresIn } = json.data;
  return {
    accessToken,
    refreshToken: newRefresh ?? refreshToken,
    expiresAt: Date.now() + (expiresIn ?? 7200) * 1000,
  };
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(`${API_BASE}/api/secondme/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message ?? "Failed to fetch user");
  return json.data ?? {};
}

export function sessionToCookie(data: SessionData): string {
  const value = encodeURIComponent(JSON.stringify(data));
  const maxAge = 30 * 24 * 60 * 60;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
