import { Shimmer } from "@/components/Skeletons";

// Covers the homepage and any route without its own loading.tsx.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <section className="surface-deep relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-16 text-center sm:px-6 sm:pt-20">
          <div className="mx-auto h-7 w-64 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto mt-6 h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-white/15 sm:h-16" />
          <div className="mx-auto mt-3 h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-white/15 sm:h-16" />
          <div className="mx-auto mt-8 h-14 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
        </div>
      </section>
      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist pt-4">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {[0, 1].map((col) => (
            <div key={col}>
              <Shimmer className="h-6 w-40 rounded-lg" />
              <div className="mt-5 rounded-card border border-navy-100/80 bg-white p-5 shadow-soft">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3.5 py-3">
                    <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Shimmer className="h-3.5 w-1/2 rounded-lg" />
                      <Shimmer className="h-3 w-4/5 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
