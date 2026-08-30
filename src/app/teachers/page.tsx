import { getTeachersWithRatings } from "@/lib/teacherQueries";
import { searchTeachers } from "@/lib/searchTeachers";
import { TeacherCard } from "@/components/TeacherCard";
import { SearchBar } from "@/components/SearchBar";
import { TeacherFilterPanel } from "@/components/TeacherFilterPanel";
import { PageHero, PageContent } from "@/components/PageHero";
import { EmptyState } from "@/components/ui";
import { SearchIcon } from "@/components/icons";

export const metadata = { title: "Roster" };

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; department?: string }>;
}) {
  const { q, department } = await searchParams;
  const teachers = await getTeachersWithRatings();

  const departments = [...new Set(teachers.map((t) => t.department))].sort();

  const byDepartment = department ? teachers.filter((t) => t.department === department) : teachers;
  const { results: filtered, isFallback } = searchTeachers(byDepartment, q ?? "");

  return (
    <div>
      <PageHero title="Roster">
        <div className="max-w-xl">
          <SearchBar defaultValue={q} placeholder="Search a teacher or subject" size="lg" />
        </div>
      </PageHero>

      <PageContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-navy-500">
              <span className="font-display text-lg font-extrabold text-navy-900">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "result" : "results"}
              {filtered.length !== teachers.length && (
                <span className="text-navy-300"> of {teachers.length}</span>
              )}
            </p>
            {q && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-navy-600 ring-1 ring-inset ring-navy-100">
                <SearchIcon className="h-3 w-3 text-navy-300" />
                {q}
              </span>
            )}
            {department && (
              <span className="inline-flex items-center rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-white">
                {department}
              </span>
            )}
          </div>
          <TeacherFilterPanel
            departments={departments}
            currentDepartment={department}
            currentQuery={q}
          />
        </div>

        {isFallback && (
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-navy-500 ring-1 ring-inset ring-navy-100">
            No exact match for <strong className="text-navy-800">{q}</strong> — here are the closest
            names.
          </p>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={<SearchIcon className="h-6 w-6" />}
            title="Nobody matched that"
            action={{ href: "/teachers", label: "See everyone" }}
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((teacher, i) => (
              <div
                key={teacher.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 35, 420)}ms` }}
              >
                <TeacherCard teacher={teacher} />
              </div>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
