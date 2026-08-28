export function RatingBar({ label, value }: { label: string; value: number | null }) {
  const pct = value === null ? 0 : (value / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-gray-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-medium text-gray-900">
        {value === null ? "—" : value.toFixed(1)}
      </span>
    </div>
  );
}
