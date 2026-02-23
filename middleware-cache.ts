import { NextResponse, type NextRequest } from "next/server";

export function cacheMiddleware(req: NextRequest) {
  const response = NextResponse.next();

  // Cache static pages for 60 seconds
  if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );
  }

  return response;
}
