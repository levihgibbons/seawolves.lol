import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The full-bleed navy frame every auth screen sits in. Keeps sign-in,
 * password reset and username setup feeling like one flow.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="surface-deep relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <span
        className="animate-tide pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-surf-500/25 blur-3xl"
        aria-hidden
      />
      <span
        className="animate-float pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-surf-600/25 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link href="/" className="mx-auto flex items-center gap-2.5 text-white">
          <Image src="/logo.png" alt="" width={72} height={62} className="h-9 w-auto" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            seawolves<span className="text-surf-300">.lol</span>
          </span>
        </Link>

        <div className="animate-fade-up mt-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">{title}</h1>
          {subtitle && (
            <div className="mt-2 text-sm leading-relaxed text-white/60">{subtitle}</div>
          )}
        </div>

        <div
          className="animate-fade-up mt-6 rounded-card border border-white/10 bg-white p-6 shadow-2xl sm:p-7"
          style={{ animationDelay: "80ms" }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="animate-fade-up mt-5 text-center text-sm text-white/55"
            style={{ animationDelay: "140ms" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
