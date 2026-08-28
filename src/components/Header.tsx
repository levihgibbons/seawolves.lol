import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "./UserMenu";

const NAV_LINKS = [
  { href: "/teachers", label: "Roster" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/the-fallen", label: "The Fallen" },
];

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-navy-dark bg-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/logo.png" alt="" width={512} height={442} className="h-9 w-auto" priority />
          <span className="text-lg font-semibold tracking-tight">RateMySeawolf</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-white/85">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <UserMenu
              name={session.user.name ?? session.user.email ?? "Account"}
              email={session.user.email ?? ""}
              isAdmin={session.user.role === "ADMIN"}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-navy hover:bg-white/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
