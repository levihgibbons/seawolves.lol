import { HeroSkeleton, ContentShell, CardGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <HeroSkeleton />
      <ContentShell>
        <CardGridSkeleton count={8} />
      </ContentShell>
    </div>
  );
}
