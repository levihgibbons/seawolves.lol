import Link from "next/link";
import { getTeachersWithRatings } from "@/lib/teacherQueries";
import { prisma } from "@/lib/prisma";
import { LEADERBOARD_MIN_REVIEWS } from "@/lib/constants";
import { TeacherCard } from "@/components/TeacherCard";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { ButtonLink, Card, SectionHeading } from "@/components/ui";
import { SearchBar } from "@/components/SearchBar";
import { formatRelativeTime } from "@/lib/format";
import { reviewOverall } from "@/lib/ratings";
import { ArrowRightIcon, ChatIcon, TrophyIcon } from "@/components/icons";


export default async function HomePage() {
  const teachers = await getTeachersWithRatings();

  const topRated = teachers
    .filter((t) => t.reviewCount >= LEADERBOARD_MIN_REVIEWS && t.overall !== null)
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, 4);

  const mostReviewed = [...teachers]
    .filter((t) => t.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);

  const totalReviews = teachers.reduce((sum, t) => sum + t.reviewCount, 0);
  const departmentCount = new Set(teachers.map((t) => t.department)).size;

  const recentReviews = await prisma.review.findMany({
    where: { status: "VISIBLE" },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="surface-deep relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <span
          className="animate-tide pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-surf-500/25 blur-3xl"
          aria-hidden
        />
        <span
          className="animate-float pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-surf-600/25 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-16 text-center sm:px-6 sm:pt-20">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-surf-200 ring-1 ring-inset ring-white/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-surf-300" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-surf-300" />
            </span>
            Pacifica Christian High School
          </span>

          <h1
            className="animate-fade-up mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Every teacher, rated by{" "}
            <span className="text-gradient">the people in the room.</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            Clarity, fairness, workload, vibes — scored by Seawolves who actually took the class.
          </p>

          <div
            className="animate-fade-up mx-auto mt-8 max-w-xl"
            style={{ animationDelay: "180ms" }}
          >
            <SearchBar placeholder="Search a teacher or subject" size="lg" />
          </div>

          <div
            className="animate-fade-up mt-5 flex flex-wrap items-center justify-center gap-2.5"
            style={{ animationDelay: "240ms" }}
          >
            <ButtonLink href="/teachers" variant="onDark" size="lg">
              Browse the roster
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-[0.95rem] font-semibold text-white ring-1 ring-inset ring-white/15 transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:scale-95"
            >
              <TrophyIcon className="h-4 w-4 text-gold-300" />
              Leaderboard
            </Link>
          </div>

          {totalReviews > 0 ? (
            <dl
              className="animate-fade-up mx-auto mt-12 grid max-w-md grid-cols-3 gap-2"
              style={{ animationDelay: "300ms" }}
            >
              {[
                { value: teachers.length, label: "Teachers" },
                { value: totalReviews, label: "Reviews" },
                { value: departmentCount, label: "Subjects" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/[0.07] px-3 py-3.5 ring-1 ring-inset ring-white/10"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl font-extrabold leading-none text-white sm:text-3xl">
                    {stat.value}
                  </dd>
                  <p className="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          ) : (
            <p
              className="animate-fade-up mt-12 text-sm font-medium text-white/70"
              style={{ animationDelay: "300ms" }}
            >
              {teachers.length} teachers. Zero reviews. Someone has to go first.
            </p>
          )}
        </div>
      </section>

      {/* Curved reveal: the light content lifts up over the navy hero. */}
      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist pt-4 shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
        {/* ------------------------------------------------------- top rated */}
        {topRated.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <SectionHeading
              icon={<TrophyIcon className="h-3.5 w-3.5" />}
              title="Top rated"
              action={{ href: "/leaderboard", label: "Full leaderboard" }}
            />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topRated.map((teacher, i) => (
                <div
                  key={teacher.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <TeacherCard teacher={teacher} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- activity */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
            <div className="animate-fade-up">
              <SectionHeading
                title="Latest reviews"
              />
              <Card className="mt-5 divide-y divide-navy-50 overflow-hidden p-0">
                {recentReviews.length === 0 ? (
                  <div className="flex flex-col items-center px-5 py-12 text-center">
                    <p className="text-sm text-navy-400">Nothing posted yet.</p>
                    <ButtonLink href="/teachers" size="sm" className="mt-4">
                      Pick a teacher
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </ButtonLink>
                  </div>
                ) : (
                  recentReviews.map((review) => (
                    <Link
                      key={review.id}
                      href={`/teachers/${review.teacherId}`}
                      className="group flex items-start gap-3.5 px-4 py-4 transition-colors duration-200 hover:bg-navy-50/60 sm:px-5"
                    >
                      <Avatar
                        name={review.teacher.name}
                        photoUrl={review.teacher.photoUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="truncate text-sm font-bold text-navy-900 transition-colors duration-200 group-hover:text-surf-600">
                            {review.teacher.name}
                          </p>
                          <StarRatingDisplay
                            value={reviewOverall(review)}
                            size="xs"
                            showValue={false}
                          />
                          <span className="text-xs text-navy-300">
                            {formatRelativeTime(review.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-navy-500">
                          {review.comment}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </Card>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              <SectionHeading
                title="Most reviewed"
              />
              <Card className="mt-5 divide-y divide-navy-50 overflow-hidden p-0">
                {mostReviewed.length === 0 ? (
                  <p className="px-5 py-12 text-center text-sm text-navy-400">
                    Nothing yet.
                  </p>
                ) : (
                  mostReviewed.map((teacher, i) => (
                    <Link
                      key={teacher.id}
                      href={`/teachers/${teacher.id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-navy-50/60"
                    >
                      <span className="w-4 shrink-0 text-center font-display text-sm font-extrabold text-navy-200">
                        {i + 1}
                      </span>
                      <Avatar name={teacher.name} photoUrl={teacher.photoUrl} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-900 transition-colors duration-200 group-hover:text-surf-600">
                          {teacher.name}
                        </p>
                        <p className="truncate text-xs text-navy-400">{teacher.department}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-navy-400">
                        <ChatIcon className="h-3.5 w-3.5" />
                        {teacher.reviewCount}
                      </span>
                    </Link>
                  ))
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- cta */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="animate-fade-up">
            <div className="surface-deep relative overflow-hidden rounded-[1.75rem] px-6 py-12 text-center sm:px-12">
              <span
                className="animate-tide pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-surf-500/30 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Somebody&apos;s picking that class next year.
                </h2>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/teachers" variant="onDark" size="lg">
                    Write a review
                    <ArrowRightIcon className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
