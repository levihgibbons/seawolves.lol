import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";
import { SparkIcon } from "./icons";

export async function Header() {
  const session = await auth();
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, body: true, createdAt: true },
  });

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-navy-950/40 bg-navy-900 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-2 text-white transition duration-200"
        >
          <Image
            src="/logo.png"
            alt=""
            width={64}
            height={55}
            priority
            className="h-8 w-auto transition-transform duration-300 ease-out-back group-hover:-rotate-6 group-hover:scale-110"
          />
          <span className="font-display text-lg font-extrabold tracking-tight">
            seawolves<span className="text-surf-300">.lol</span>
          </span>
        </Link>

        <div className="mx-auto">
          <MainNav />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <NotificationBell
            notifications={announcements.map((a) => ({
              id: a.id,
              title: a.title,
              body: a.body,
              createdAt: a.createdAt.toISOString(),
            }))}
          />
          {user ? (
            <>
              <div className="hidden lg:block">
                <UserMenu
                  name={user.username ?? user.name ?? user.email ?? "Account"}
                  email={user.email ?? ""}
                  image={user.image ?? null}
                  isAdmin={user.role === "ADMIN"}
                />
              </div>
              <MobileMenu
                signedIn
                username={user.username ?? null}
                isAdmin={user.role === "ADMIN"}
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-navy-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-surf-100 hover:shadow-pop active:scale-95 sm:inline-flex"
              >
                Sign in
              </Link>
              <MobileMenu signedIn={false} username={null} isAdmin={false} />
            </>
          )}
        </div>
      </div>

      {user && !user.username && (
        <Link
          href="/choose-username"
          className="group block border-t border-white/10 bg-surf-500/15 transition duration-200 hover:bg-surf-500/25"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-surf-100 sm:px-6">
            <SparkIcon className="h-4 w-4" />
            Pick a username to start posting
            <span className="underline decoration-surf-300/60 underline-offset-4 group-hover:decoration-surf-300">
              Choose one
            </span>
          </div>
        </Link>
      )}
    </header>
  );
}
