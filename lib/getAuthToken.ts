export function getAuthToken(cookie: string | null) {
  if (!cookie) return null;

  const match = cookie.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}
