import { cx } from "./ui";

/**
 * Shared pieces for the route-level loading.tsx files. These mirror the real
 * layout closely enough that the swap to real content is barely visible —
 * without them every navigation was a frozen click while the server queried.
 */
export function Shimmer({ className }: { className?: string }) {
  // No radius in the base string: `cx` is a plain join, so a base `rounded-lg`
  // would fight every `rounded-full` a caller passes and skeleton avatars would
  // render as squares.
  return <div className={cx("animate-pulse bg-navy-100/80", className)} aria-hidden />;
}

/** The navy band every page opens with, minus the text. */
export function HeroSkeleton({ control }: { control?: React.ReactNode }) {
  return (
    <section className="surface-deep relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-14">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-white/15 sm:h-14 sm:w-72" />
        {/* PageHero wraps its children in `mt-7`; reserve the same box or the
            content panel jumps down ~80px when the real hero arrives. */}
        {control && <div className="mt-7">{control}</div>}
      </div>
    </section>
  );
}

export function ContentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-card border border-navy-100/80 bg-white p-4 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Shimmer className="h-3.5 w-3/4 rounded-lg" />
              <Shimmer className="h-3 w-1/2 rounded-lg" />
            </div>
          </div>
          <div className="mt-6 border-t border-navy-50 pt-3">
            <Shimmer className="h-3 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-card border border-navy-100/80 bg-white p-3.5 shadow-soft"
        >
          <Shimmer className="h-4 w-4 shrink-0 rounded" />
          <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-3.5 w-40 rounded-lg" />
            <Shimmer className="h-3 w-24 rounded-lg" />
          </div>
          <Shimmer className="h-6 w-10 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
