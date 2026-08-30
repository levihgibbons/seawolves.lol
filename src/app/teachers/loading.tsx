import { HeroSkeleton, ContentShell, CardGridSkeleton, Shimmer } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading the roster…</span>
      <HeroSkeleton
        control={
          <div className="h-[3.55rem] w-full max-w-xl animate-pulse rounded-full bg-white/10" />
        }
      />
      <ContentShell>
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-9 w-28 rounded-full" />
        </div>
        <div className="mt-6">
          <CardGridSkeleton count={12} />
        </div>
      </ContentShell>
    </div>
  );
}
