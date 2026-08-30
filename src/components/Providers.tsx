"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

// The session is passed in from the root layout (which already resolved it on
// the server). Without it next-auth treats the session as unknown and fires a
// client-side /api/auth/session request on every page load.
export function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
