import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Every user needs a username before they can be attributed on a review or
// comment (see src/lib/apiAuth.ts requireActivePostingUser for the
// server-side enforcement this backs up). Credentials signups pick one as
// part of the login flow's "create your account" step; Google sign-ins
// never fill out a form, so this catches those — and anyone else — on
// their next page load and routes them to pick one before continuing.
const EXEMPT_PREFIXES = ["/choose-username", "/login", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;

  const user = req.auth?.user;
  if (user && !user.username) {
    const url = new URL("/choose-username", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
