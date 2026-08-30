import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/nav";

export async function Footer() {
  const session = await auth();

  const linkClass =
    "inline-flex min-h-9 items-center text-sm text-white/60 transition duration-200 hover:translate-x-0.5 hover:text-surf-300";

  return (
    <footer className="surface-deep mt-20 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div
          className="dot-grid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        />
        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={64} height={55} className="h-8 w-auto" />
              <p className="font-display text-lg font-extrabold tracking-tight text-white">
                seawolves<span className="text-surf-300">.lol</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-surf-300">
              Explore
            </p>
            <ul className="mt-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-surf-300">
              Account
            </p>
            <ul className="mt-1">
              {session?.user ? (
                <>
                  <li>
                    <Link href="/account" className={linkClass}>
                      My profile
                    </Link>
                  </li>
                  {session.user.role === "ADMIN" && (
                    <li>
                      <Link href="/admin" className={linkClass}>
                        Admin
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <Link href="/login" className={linkClass}>
                    Sign in
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="relative mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-white/40">
            Reviews reflect the opinions of individual students, not verified facts or the position
            of Pacifica Christian High School.
          </p>
          <p className="shrink-0 text-xs font-semibold text-white/40">
            &copy; {new Date().getFullYear()} seawolves.lol
          </p>
        </div>
      </div>
    </footer>
  );
}
