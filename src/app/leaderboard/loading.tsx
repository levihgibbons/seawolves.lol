import { HeroSkeleton, RowListSkeleton, Shimmer } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading the leaderboard…</span>
      <HeroSkeleton
        control={<div className="h-[3.25rem] w-full max-w-md animate-pulse rounded-full bg-white/10" />}
      />
      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-card border border-navy-100/80 bg-white px-4 pb-5 pt-6 shadow-soft"
              >
                <Shimmer className="h-3 w-6" />
                <Shimmer className="mt-3 h-12 w-12 rounded-full" />
                <Shimmer className="mt-3 h-3.5 w-24" />
                <Shimmer className="mt-2 h-3 w-16" />
                <Shimmer className="mt-3 h-7 w-12" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <RowListSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
