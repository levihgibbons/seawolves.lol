import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Footer() {
  const session = await auth();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="footer-divider" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={512} height={442} className="h-7 w-auto" />
              <p className="text-sm font-semibold text-navy">seawolves.lol</p>
            </div>
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-gray-500">
              Honest teacher reviews, written by Seawolves, for Seawolves.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Site</p>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
              <li>
                <Link href="/teachers" className="hover:text-navy">
                  Roster
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-navy">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/the-fallen" className="hover:text-navy">
                  The Fallen
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-navy">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Account</p>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
              {session?.user ? (
                <>
                  <li>
                    <Link href="/account" className="hover:text-navy">
                      My profile
                    </Link>
                  </li>
                  {session.user.role === "ADMIN" && (
                    <li>
                      <Link href="/admin" className="hover:text-navy">
                        Admin dashboard
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <Link href="/login" className="hover:text-navy">
                    Sign in
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} seawolves.lol</p>
        </div>
      </div>
    </footer>
  );
}
