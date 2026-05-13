import { NextRequest, NextResponse } from "next/server";

// Routes that REQUIRE the user to be logged in. Anything else is public
// (landing, login, register, translate, news).
const PROTECTED_PREFIXES = ["/chat", "/settings"];

// Pages auth'd users shouldn't see (login / register).
const AUTH_ONLY_VISITOR_PAGES = ["/login", "/register"];

const COOKIE_NAME = "speakly_session";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasCookie = req.cookies.has(COOKIE_NAME);

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!hasCookie) {
      // Bounce to login with `next` param so we can restore the deep link.
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_ONLY_VISITOR_PAGES.includes(pathname) && hasCookie) {
    // Logged-in users hitting login/register go straight to chat.
    const url = req.nextUrl.clone();
    url.pathname = "/chat";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Skip Next.js internals + static assets — only run on real pages.
export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\..*).*)"],
};
