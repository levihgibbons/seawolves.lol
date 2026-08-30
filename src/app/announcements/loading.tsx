import { HeroSkeleton, Shimmer } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading announcements…</span>
      <HeroSkeleton />
      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-card border border-navy-100/80 bg-white p-5 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <Shimmer className="h-10 w-10 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-4 w-2/3" />
                  <Shimmer className="h-3 w-28" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
