import Link from "next/link";
import { Avatar } from "./Avatar";
import { StarRatingDisplay } from "./StarRating";
import { cx } from "./ui";

export type BoardEntry = {
  id: string;
  name: string;
  department: string;
  photoUrl: string | null;
  /** The number this board ranks on, already formatted for display. */
  display: string;
  /** Raw 0-5 rating for the star row, or null on count-based boards. */
  stars: number | null;
};

const MEDALS = [
  { ring: "ring-gold-300", glow: "bg-gold-300/20", text: "text-gold-500", bar: "from-gold-300 to-gold-500" },
  { ring: "ring-navy-200", glow: "bg-navy-200/20", text: "text-navy-400", bar: "from-navy-200 to-navy-400" },
  { ring: "ring-orange-300", glow: "bg-orange-300/20", text: "text-orange-500", bar: "from-orange-200 to-orange-400" },
];

/**
 * Podium for the top three, plain ranked rows for everyone else. Kept separate
 * from the page so the layout can be exercised without seeding the database.
 */
export function LeaderboardBoard({ entries, unit }: { entries: BoardEntry[]; unit: string }) {
  // A one- or two-card podium looks broken hugging the left third, so only
  // build one once all three places are filled.
  const hasPodium = entries.length >= 3;
  const podium = hasPodium ? entries.slice(0, 3) : [];
  const rest = hasPodium ? entries.slice(3) : entries;

  return (
    <>
      <div className={cx("grid grid-cols-1 gap-3 sm:grid-cols-3", !hasPodium && "hidden")}>
        {podium.map((t, i) => (
          <Link
            key={t.id}
            href={`/teachers/${t.id}`}
            className={cx(
              "group animate-fade-up relative flex flex-col items-center overflow-hidden rounded-card border border-navy-100/80 bg-white px-4 pb-5 pt-6 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:border-surf-200 hover:shadow-lift",
              i === 0 && "sm:-mt-3 sm:pb-7 sm:pt-8"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span
              className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", MEDALS[i].bar)}
              aria-hidden
            />
            <span
              className={cx(
                "pointer-events-none absolute -top-12 h-24 w-24 rounded-full blur-3xl",
                MEDALS[i].glow
              )}
              aria-hidden
            />
            <span
              className={cx(
                "relative font-display text-xs font-extrabold uppercase tracking-[0.16em]",
                MEDALS[i].text
              )}
            >
              #{i + 1}
            </span>
            <Avatar
              name={t.name}
              photoUrl={t.photoUrl}
              size={i === 0 ? "lg" : "md"}
              ring={false}
              className={cx(
                "relative mt-3 ring-4 transition-transform duration-300 ease-out-back group-hover:scale-105",
                MEDALS[i].ring
              )}
            />
            <p className="relative mt-3 font-display text-[0.95rem] font-extrabold leading-tight tracking-tight text-navy-900">
              {t.name}
            </p>
            <p className="relative mt-0.5 w-full truncate text-xs text-navy-400">{t.department}</p>
            <p className="relative mt-3 font-display text-3xl font-extrabold leading-none text-navy-900">
              {t.display}
            </p>
            <p className="relative mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-navy-300">
              {unit}
            </p>
          </Link>
        ))}
      </div>

      {rest.length > 0 && (
        <ol className={cx("space-y-2", hasPodium && "mt-4")}>
          {rest.map((t, i) => (
            <li
              key={t.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 35, 300)}ms` }}
            >
              <Link
                href={`/teachers/${t.id}`}
                className="group flex items-center gap-3 rounded-card border border-navy-100/80 bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-surf-200 hover:shadow-lift sm:gap-4 sm:p-3.5"
              >
                <span className="w-7 shrink-0 text-center font-display text-sm font-extrabold text-navy-300">
                  {hasPodium ? i + 4 : i + 1}
                </span>
                <Avatar name={t.name} photoUrl={t.photoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-navy-900 transition-colors duration-200 group-hover:text-surf-600">
                    {t.name}
                  </p>
                  <p className="truncate text-xs text-navy-400">{t.department}</p>
                </div>
                {t.stars !== null && (
                  <StarRatingDisplay
                    value={t.stars}
                    size="xs"
                    showValue={false}
                    className="hidden sm:inline-flex"
                  />
                )}
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg font-extrabold leading-none text-navy-900">
                    {t.display}
                  </p>
                  <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-navy-300">
                    {unit}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
