const API_BASE =
  process.env.SECONDME_API_BASE_URL ?? "https://api.mindverse.com/gate/lab";

const OAUTH_URL =
  process.env.SECONDME_OAUTH_URL ?? "https://go.second.me/oauth/";

const COOKIE_NAME = "nexuslab_session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function shouldUseSecureCookies(): boolean {
  const publicUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.GITHUB_REDIRECT_URI;
  return publicUrl?.startsWith("https://") ?? false;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export function sessionCookieValue(data: SessionData): string {
  return encodeURIComponent(JSON.stringify(data));
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}

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

  if (!data.provider) {
    data.provider = "secondme";
  }

  if (data.expiresAt && Date.now() > data.expiresAt - 60_000) {
    return null;
  }

  return data;
}

/**
 * Second Me 登录 URL
 * 备用登录入口：/api/auth/login
 */
export function buildLoginUrl(state: string): string {
  const clientId = process.env.SECONDME_CLIENT_ID;
  const redirectUri = process.env.SECONDME_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing SECONDME_CLIENT_ID or SECONDME_REDIRECT_URI");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });

  return `${OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<SessionData> {
  const clientId = process.env.SECONDME_CLIENT_ID;
  const clientSecret = process.env.SECONDME_CLIENT_SECRET;
  const redirectUri = process.env.SECONDME_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing SECONDME_CLIENT_ID, SECONDME_CLIENT_SECRET or SECONDME_REDIRECT_URI"
    );
  }

  const res = await fetch(`${API_BASE}/api/oauth/token/code`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
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

export async function refreshAccessToken(
  refreshToken: string
): Promise<SessionData> {
  const clientId = process.env.SECONDME_CLIENT_ID;
  const clientSecret = process.env.SECONDME_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SECONDME_CLIENT_ID or SECONDME_CLIENT_SECRET");
  }

  const res = await fetch(`${API_BASE}/api/oauth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
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

/**
 * GitHub 登录 URL
 * 主登录入口：/api/auth/github/login
 *
 * 线上部署时，优先使用 Zeabur 环境变量：
 * GITHUB_REDIRECT_URI=https://nexus-lab.zeabur.app/api/auth/github/callback
 */
export function buildGithubLoginUrl(
  state: string,
  redirectUriFromRoute?: string
): string {
  const clientId = process.env.GITHUB_CLIENT_ID;

  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    redirectUriFromRoute ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
      : undefined);

  if (!clientId) {
    throw new Error("Missing GITHUB_CLIENT_ID");
  }

  if (!redirectUri) {
    throw new Error(
      "Missing GITHUB_REDIRECT_URI or NEXT_PUBLIC_APP_URL for GitHub OAuth"
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "read:user user:email",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGithubCodeForToken(
  code: string,
  redirectUri?: string
): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET");
  }

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
      ...(redirectUri ? { redirect_uri: redirectUri } : {}),
    }),
  });

  const json = await res.json();

  if (!json.access_token) {
    throw new Error(
      json.error_description ?? json.error ?? "GitHub token exchange failed"
    );
  }

  return json.access_token as string;
}

export async function fetchGithubUserInfo(
  accessToken: string
): Promise<UserInfo> {
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const userJson = await userRes.json();

  if (!userRes.ok) {
    throw new Error(userJson?.message ?? "Failed to fetch GitHub user");
  }

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

  if (json.code !== 0) {
    throw new Error(json.message ?? "Failed to fetch user");
  }

  return json.data ?? {};
}

export function sessionToCookie(data: SessionData): string {
  const value = sessionCookieValue(data);
  const maxAge = COOKIE_MAX_AGE;
  const secure = shouldUseSecureCookies() ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setSessionCookie(data: SessionData): string {
  return sessionToCookie(data);
}

export function clearSessionCookie(): string {
  const secure = shouldUseSecureCookies() ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
