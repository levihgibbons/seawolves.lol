import NextAuth, { type Session } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";
import { verifyPassword } from "./hash";
import { loginSchema } from "./validation";
import { isAllowedEmail, roleForEmail } from "./accountPolicy";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // NOTE: intentionally returns null (not a distinguishing error) for
      // every failure case — wrong password, unknown email, and a
      // suspended/banned account all look identical to an attacker probing
      // for valid accounts. The login page shows one generic message and
      // points to "forgot password" / "contact an admin" as next steps.
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.status !== "ACTIVE") return null;
        if (!user.hashedPassword) return null; // Google-only account, no password set

        const valid = await verifyPassword(password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified !== null,
          username: user.username,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Only relevant for the Google provider — Credentials already did all
    // of this validation in authorize() above. No adapter is configured,
    // so this is the one place an OAuth sign-in touches our own User
    // table: find-or-create by email, enforce the same domain allowlist
    // and suspended/banned check the Credentials path enforces, and skip
    // the code-verification step entirely, since Google already proved
    // this person controls the inbox.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;
      if (!isAllowedEmail(email)) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return existing.status === "ACTIVE";

      await prisma.user.create({
        data: {
          email,
          name: user.name,
          hashedPassword: null,
          role: roleForEmail(email),
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Fired by the client's useSession().update({ username }) call right
      // after /api/auth/set-username or /api/auth/reset-password writes
      // it — merge it in directly rather than round-tripping to the DB.
      if (trigger === "update" && session && typeof session.username === "string") {
        token.username = session.username;
        return token;
      }

      if (account?.provider === "google") {
        // signIn() above guarantees a matching User row exists by now.
        const dbUser = await prisma.user.findUnique({ where: { email: token.email! } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified !== null;
          token.username = dbUser.username;
        }
        return token;
      }

      // `user` is only ever populated (on sign-in) from our Credentials
      // `authorize()` above, which always returns our custom shape — never
      // an `AdapterUser` (no adapter is configured). The library's own
      // param type is a broader `User | AdapterUser` union, so narrow it
      // here rather than fighting that union in the callback signature.
      const appUser = user as
        | { id: string; role: string; emailVerified: boolean; username: string | null }
        | undefined;
      if (appUser) {
        token.id = appUser.id;
        token.role = appUser.role;
        token.emailVerified = appUser.emailVerified;
        token.username = appUser.username;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.emailVerified = token.emailVerified;
      session.user.username = token.username;
      return session;
    },
  },
});
