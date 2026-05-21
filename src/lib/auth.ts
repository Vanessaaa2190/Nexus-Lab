/**
 * Second Me OAuth 会话与 API 基础
 * API 文档: https://develop-docs.second.me/zh/docs/api-reference/secondme
 */

const API_BASE = process.env.SECONDME_API_BASE_URL ?? "https://api.mindverse.com/gate/lab";
const OAUTH_URL = process.env.SECONDME_OAUTH_URL ?? "https://go.second.me/oauth/";
const COOKIE_NAME = "nexuslab_session";

export interface SessionData {
  provider: "secondme" | "github";
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user?: UserInfo;
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
  if (!data.provider) data.provider = "secondme";
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
    provider: "secondme",
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
    provider: "secondme",
    accessToken,
    refreshToken: newRefresh ?? refreshToken,
    expiresAt: Date.now() + (expiresIn ?? 7200) * 1000,
  };
}

export function buildGithubLoginUrl(state: string, redirectUri: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) throw new Error("Missing GITHUB_CLIENT_ID");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGithubCodeForToken(code: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET");

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "nexuslab-demo",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(json.error_description ?? json.error ?? "GitHub token exchange failed");
  }
  return json.access_token as string;
}

export async function fetchGithubUserInfo(accessToken: string): Promise<UserInfo> {
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const userJson = await userRes.json();
  if (!userRes.ok) throw new Error(userJson?.message ?? "Failed to fetch GitHub user");

  let email: string | undefined;
  const emailsRes = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (emailsRes.ok) {
    const emailsJson = (await emailsRes.json()) as Array<{
      email: string;
      primary?: boolean;
      verified?: boolean;
      visibility?: string | null;
    }>;
    email =
      emailsJson.find((e) => e.primary && e.verified)?.email ??
      emailsJson.find((e) => e.primary)?.email ??
      emailsJson[0]?.email;
  }

  return {
    id: String(userJson.id ?? ""),
    name: userJson.name ?? undefined,
    nickname: userJson.login ?? undefined,
    route: userJson.login ?? undefined,
    avatarUrl: userJson.avatar_url ?? undefined,
    email: email ?? userJson.email ?? undefined,
    shades: [],
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
