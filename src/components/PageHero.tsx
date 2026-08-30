import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * The navy band every interior page opens with. Pair it with `PageContent`,
 * which lifts the light content up over the band's bottom edge so the whole
 * site shares one silhouette.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("surface-deep relative overflow-hidden", className)}>
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <span
        className="animate-tide pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-surf-500/25 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-14">
        {eyebrow && (
          <p className="animate-fade-up flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-surf-300">
            {icon}
            {eyebrow}
          </p>
        )}
        <h1
          className="animate-fade-up mt-2.5 text-balance font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl"
          style={{ animationDelay: "50ms" }}
        >
          {title}
        </h1>
        {description && (
          <div
            className="animate-fade-up mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/65 sm:text-base"
            style={{ animationDelay: "100ms" }}
          >
            {description}
          </div>
        )}
        {children && (
          <div className="animate-fade-up mt-7" style={{ animationDelay: "150ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function PageContent({
  children,
  width = "max-w-6xl",
  className,
}: {
  children: ReactNode;
  /** Tailwind max-width class for the inner container. */
  width?: string;
  className?: string;
}) {
  return (
    <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
      <div className={cx("mx-auto px-4 py-10 sm:px-6", width, className)}>{children}</div>
    </div>
  );
}
