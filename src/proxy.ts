import { auth } from "@/lib/auth";

// Every user needs a username before they can be attributed on a review or
// comment (see src/lib/apiAuth.ts requireActivePostingUser for the actual
// enforcement, and Header.tsx's account-setup banner for the nudge). This
// used to hard-redirect every page to /choose-username for a signed-in user
// without one — Credentials signups now pick a username as part of the
// login flow's "create your account" step, so in practice that only ever
// hit older/Google-only accounts, and blocking all navigation for it made
// the whole site look broken rather than prompting for one page. Left as a
// pass-through (rather than deleted) so reintroducing user-scoped
// middleware later doesn't mean re-deriving the exemption list.
export default auth(() => {});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
