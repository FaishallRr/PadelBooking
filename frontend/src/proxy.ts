import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const url = req.nextUrl.clone();

  if (!token && url.pathname.startsWith("/dashboard-mitra")) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (role === "user" && url.pathname.startsWith("/dashboard-mitra")) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard-mitra/:path*", "/dashboard-admin/:path*"],
};
