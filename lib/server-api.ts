import { cookies, headers } from "next/headers";
import { cache } from "react";

const LIVE_BASE_URL = "https://zeenetwork.vercel.app";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type AuthCookieName = "admin_token" | "auth_token";

export type ServerApiResult<T> = {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
};

type ServerApiOptions = {
  method?: HttpMethod;
  body?: unknown;
  authCookie?: AuthCookieName;
  cache?: RequestCache;
  next?: RequestInit["next"];
};

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeEndpoint(endpoint: string) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

const resolveRequestBaseUrl = cache(async () => {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (envBaseUrl) {
    return stripTrailingSlash(envBaseUrl);
  }

  return LIVE_BASE_URL;
});

export async function getRequestBaseUrl() {
  return resolveRequestBaseUrl();
}

async function readJsonBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function serverApiFetch<T>(
  endpoint: string,
  options: ServerApiOptions = {},
): Promise<ServerApiResult<T>> {
  const {
    method = "GET",
    body,
    authCookie,
    cache,
    next,
  } = options;
 
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const url =
    normalizedEndpoint.startsWith("http://") ||
    normalizedEndpoint.startsWith("https://")
      ? normalizedEndpoint
      : `${await getRequestBaseUrl()}${normalizedEndpoint}`;

  const requestHeaders: Record<string, string> = {};

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (authCookie) {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookie)?.value;

    if (token) {
      requestHeaders.Cookie = `${authCookie}=${token}`;
    }
  }

  const resolvedCache =
    cache ?? (next && method === "GET" ? undefined : "no-store");

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(resolvedCache ? { cache: resolvedCache } : {}),
    next,
  });

  const payload = await readJsonBody(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload
        ? ((payload as { error?: string; message?: string }).error ||
          (payload as { error?: string; message?: string }).message)
        : undefined;

    return {
      success: false,
      status: response.status,
      error: message || `Request failed with status ${response.status}`,
      data: payload as T | undefined,
    };
  }

  return {
    success: true,
    status: response.status,
    data: payload as T | undefined,
  };
}
