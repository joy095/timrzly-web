// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_URL } from "./const";
import { User } from "better-auth";

const AUTH_ROUTES = ["/auth"];
const PROTECTED_ROUTES = [
  "/profile",
  "/dashboard",
  "/settings",
  "/appointments",
];
const PUBLIC_ROUTES = ["/", "/test"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const BACKEND_URL = AUTH_URL;

  const cookieHeader = request.headers.get("cookie") || "";
  let isAuthenticated = false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // Prevents Next.js from caching the logged-out state
    });

    if (response.ok) {
      const session = (await response.json()) as { user?: User };

      // Safely check if session exists before reading .user
      if (session && session.user) {
        isAuthenticated = true;
      }
    }
  } catch (error) {
    console.error("External Auth Server connection error:", error);
    isAuthenticated = false;
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });

  if (isAuthenticated) {
    if (!isProtectedRoute && !isPublicRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    if (!isAuthRoute && !isPublicRoute) {
      const signInUrl = new URL("/auth/sign-in", request.url);

      if (isProtectedRoute) {
        signInUrl.searchParams.set("callbackUrl", pathname);
      }

      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
