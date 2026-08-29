import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserMenu } from "./UserMenu";
import { AnnouncementBell } from "./AnnouncementBell";

const NAV_LINKS = [
  { href: "/teachers", label: "Roster" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/the-fallen", label: "The Fallen" },
];

export async function Header() {
  const session = await auth();
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, body: true, createdAt: true },
  });

  return (
    <header className="border-b border-navy-dark bg-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/logo.png" alt="" width={512} height={442} className="h-9 w-auto" priority />
          <span className="text-lg font-semibold tracking-tight">seawolves.lol</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-white/85">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AnnouncementBell
            announcements={announcements.map((a) => ({
              id: a.id,
              title: a.title,
              body: a.body,
              createdAt: a.createdAt.toISOString(),
            }))}
          />
          {session?.user ? (
            <UserMenu
              name={session.user.username ?? session.user.name ?? session.user.email ?? "Account"}
              email={session.user.email ?? ""}
              isAdmin={session.user.role === "ADMIN"}
              username={session.user.username}
            />
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-navy hover:bg-white/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {session?.user && !session.user.username && (
        <div className="border-t border-navy-dark bg-navy-light/40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-white/90 sm:px-6">
            <span>Pick a username to post reviews and comments under.</span>
            <Link href="/choose-username" className="font-medium text-white underline hover:no-underline">
              Choose username
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
