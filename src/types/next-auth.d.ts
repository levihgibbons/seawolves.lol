import type { DefaultSession } from "next-auth";

// `next-auth`'s own package only re-exports these types from `@auth/core`
// (`export type { Session, User } from "@auth/core/types"`), so augmenting
// the `next-auth` module doesn't merge into the real declarations —
// augment `@auth/core/types` / `@auth/core/jwt` directly instead.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    emailVerified: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    emailVerified: boolean;
  }
}
