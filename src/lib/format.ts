// Absolute date + time, split into two strings so callers can stack them
// (e.g. a channel-style announcement timestamp) instead of one long line.
export function formatDateTimeStacked(date: Date): { date: string; time: string } {
  return {
    date: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date),
    time: new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(date),
  };
}

export function formatRelativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let value = seconds;
  for (const [limit, unit] of units) {
    if (value < limit) {
      const rounded = Math.floor(value);
      return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
    }
    value /= limit;
  }
  return date.toLocaleDateString();
}
