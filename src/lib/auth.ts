import NextAuth, { type Session } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./hash";
import { loginSchema } from "./validation";

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

        const valid = await verifyPassword(password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified !== null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only ever populated (on sign-in) from our Credentials
      // `authorize()` above, which always returns our custom shape — never
      // an `AdapterUser` (no adapter is configured). The library's own
      // param type is a broader `User | AdapterUser` union, so narrow it
      // here rather than fighting that union in the callback signature.
      const appUser = user as { id: string; role: string; emailVerified: boolean } | undefined;
      if (appUser) {
        token.id = appUser.id;
        token.role = appUser.role;
        token.emailVerified = appUser.emailVerified;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.emailVerified = token.emailVerified;
      return session;
    },
  },
});
