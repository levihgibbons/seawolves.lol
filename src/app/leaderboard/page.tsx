import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeRatingBreakdown } from "@/lib/ratings";
import { LEADERBOARD_MIN_REVIEWS, type RatingCategory } from "@/lib/constants";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { PageHero } from "@/components/PageHero";
import { EmptyState, cx } from "@/components/ui";
import { ChatIcon, FlameIcon, TrophyIcon } from "@/components/icons";

export const metadata = { title: "Leaderboard" };

type BoardKey = "top" | "loved" | "reviewed";

// Three boards, not a filter form. Each one is its own leaderboard with its own
// unit — that's what makes it read as a board rather than a settings screen.
const BOARDS: {
  key: BoardKey;
  label: string;
  icon: typeof TrophyIcon;
  unit: string;
  // What the big number on each row means.
  value: (t: Ranked) => number | null;
  // Boards ranked on a rating need a review floor; a raw count doesn't.
  needsFloor: boolean;
}[] = [
  {
    key: "top",
    label: "Top rated",
    icon: TrophyIcon,
    unit: "overall",
    value: (t) => t.overall,
    needsFloor: true,
  },
  {
    key: "loved",
    label: "Most loved",
    icon: FlameIcon,
    unit: "approachability",
    value: (t) => t.byCategory.approachability,
    needsFloor: true,
  },
  {
    key: "reviewed",
    label: "Most reviewed",
    icon: ChatIcon,
    unit: "reviews",
    value: (t) => t.count,
    needsFloor: false,
  },
];

type Ranked = {
  id: string;
  name: string;
  department: string;
  photoUrl: string | null;
  overall: number | null;
  count: number;
  byCategory: Record<RatingCategory, number | null>;
};


export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const { board: rawBoard } = await searchParams;
  const board = BOARDS.find((b) => b.key === rawBoard) ?? BOARDS[0];

  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    include: {
      reviews: {
        where: { status: "VISIBLE" },
        select: { clarity: true, fairness: true, workload: true, approachability: true },
      },
    },
  });

  const ranked: Ranked[] = teachers.map((t) => {
    const breakdown = computeRatingBreakdown(t.reviews);
    return {
      id: t.id,
      name: t.name,
      department: t.department,
      photoUrl: t.photoUrl,
      overall: breakdown.overall,
      count: breakdown.count,
      byCategory: breakdown.byCategory,
    };
  });

  const eligible = ranked.filter((t) =>
    board.needsFloor ? t.count >= LEADERBOARD_MIN_REVIEWS : t.count > 0
  );

  const sorted = [...eligible].sort((a, b) => (board.value(b) ?? -1) - (board.value(a) ?? -1));
  const format = (t: Ranked) => {
    const v = board.value(t);
    if (v === null) return "—";
    return board.key === "reviewed" ? String(v) : v.toFixed(1);
  };

  return (
    <div>
      <PageHero title="Leaderboard">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:inline-flex sm:overflow-visible sm:rounded-full sm:bg-white/[0.07] sm:p-1 sm:pb-1 sm:ring-1 sm:ring-inset sm:ring-white/10">
          {BOARDS.map((b) => {
            const active = b.key === board.key;
            const Icon = b.icon;
            return (
              <Link
                key={b.key}
                href={`/leaderboard?board=${b.key}`}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition duration-200",
                  active
                    ? "bg-white text-navy-800 shadow-soft"
                    : "bg-white/[0.07] text-white/70 ring-1 ring-inset ring-white/10 hover:bg-white/15 hover:text-white sm:bg-transparent sm:ring-0"
                )}
              >
                <Icon className="h-4 w-4" />
                {b.label}
              </Link>
            );
          })}
        </div>
      </PageHero>

      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {sorted.length === 0 ? (
            <EmptyState
              icon={<TrophyIcon className="h-6 w-6" />}
              title="No one's on the board yet"
              action={{ href: "/teachers", label: "Rate a teacher" }}
            >
              {board.needsFloor
                ? `Takes ${LEADERBOARD_MIN_REVIEWS} reviews to qualify.`
                : null}
            </EmptyState>
          ) : (
            <LeaderboardBoard
              unit={board.unit}
              entries={sorted.map((t) => ({
                id: t.id,
                name: t.name,
                department: t.department,
                photoUrl: t.photoUrl,
                display: format(t),
                stars: board.key === "reviewed" ? null : board.value(t),
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
