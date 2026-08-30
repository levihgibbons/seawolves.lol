import { Shimmer } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading teacher…</span>
      <section className="surface-deep relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-white/15" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-9 w-64 animate-pulse rounded-xl bg-white/15" />
              <div className="h-4 w-40 animate-pulse rounded-lg bg-white/10" />
            </div>
            <div className="h-20 w-44 animate-pulse rounded-2xl bg-white/[0.07]" />
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="lg:order-2">
            <div className="rounded-card border border-navy-100/80 bg-white p-5 shadow-soft">
              <Shimmer className="h-3 w-28" />
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Shimmer className="h-3 w-28 shrink-0" />
                    <Shimmer className="h-2.5 flex-1 rounded-full" />
                    <Shimmer className="h-3 w-6 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:order-1">
            <Shimmer className="h-11 w-56 rounded-full" />
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-card border border-navy-100/80 bg-white p-5 shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Shimmer className="h-3.5 w-28" />
                      <Shimmer className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Shimmer className="h-3 w-full" />
                    <Shimmer className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
