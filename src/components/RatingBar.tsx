import { cx } from "./ui";

export function RatingBar({
  label,
  value,
  index = 0,
}: {
  label: string;
  value: number | null;
  // Staggers the fill animation so the breakdown cascades in.
  index?: number;
}) {
  const pct = value === null ? 0 : (value / 5) * 100;
  const strong = (value ?? 0) >= 4;

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-navy-500 sm:w-32">
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-navy-50">
        <div
          className={cx(
            "bar-fill h-full rounded-full bg-gradient-to-r",
            strong ? "from-surf-500 to-surf-300" : "from-navy-700 to-navy-400"
          )}
          style={{ width: `${pct}%`, animationDelay: `${index * 90}ms` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-display text-sm font-extrabold text-navy-900">
        {value === null ? "—" : value.toFixed(1)}
      </span>
    </div>
  );
}
