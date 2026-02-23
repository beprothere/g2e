import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const protectedUserRoutes = [
  "/dashboard",
  "/profile",
  "/wallet",
  "/referral",
  "/rewards-tiers",
  "/investor-plans",
  "/team",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userToken = req.cookies.get("auth_token")?.value;
  const adminToken = req.cookies.get("admin_token")?.value;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  if (protectedUserRoutes.some((p) => pathname.startsWith(p))) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  
  if ((pathname === "/login" || pathname === "/signup" || pathname === "/account-created") && userToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (adminToken) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const { payload }: any = await jwtVerify(adminToken, JWT_SECRET);
      
      if (payload.isSuperAdmin) {
        return NextResponse.next({ request: { headers: requestHeaders } });
      }

      if (pathname === "/admin/profile" || pathname === "/admin/account") {
        return NextResponse.next({ request: { headers: requestHeaders } });
      }

      const rolePages = payload.rolePages || []; 
      const isAllowed = rolePages.some((key: string) => {
        const targetPath = key === "dashboard" ? "/admin" : `/admin/${key}`;
        return pathname === targetPath || pathname.startsWith(targetPath + "/");
      });

      if (!isAllowed) {
        const firstPage = rolePages[0] === "dashboard" ? "/admin" : `/admin/${rolePages[0]}`;
        const fallback = rolePages.length > 0 ? firstPage : "/admin/profile";
        return NextResponse.redirect(new URL(fallback, req.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/wallet/:path*",
    "/referral/:path*",
    "/rewards-tiers",
    "/investor-plans",
    "/team",
    "/login",
    "/account-created",
    "/signup",
    "/admin/:path*",
  ],
};
