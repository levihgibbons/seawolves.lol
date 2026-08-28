import { getTeachersWithRatings } from "@/lib/teacherQueries";
import { searchTeachers } from "@/lib/searchTeachers";
import { TeacherCard } from "@/components/TeacherCard";
import { SearchBar } from "@/components/SearchBar";
import { TeacherFilterPanel } from "@/components/TeacherFilterPanel";
import { Badge } from "@/components/ui";

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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> of{" "}
          {teachers.length} teachers
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar defaultValue={q} placeholder="Search by name or subject..." size="lg" />
        </div>
        <TeacherFilterPanel departments={departments} currentDepartment={department} currentQuery={q} />
      </div>

      {department && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtered by:</span>
          <Badge tone="navy">{department}</Badge>
        </div>
      )}

      {isFallback && (
        <p className="mt-4 text-sm text-gray-500">
          No exact match for &ldquo;{q}&rdquo; — here are the closest names.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((teacher, i) => (
          <div
            key={teacher.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
          >
            <TeacherCard teacher={teacher} />
          </div>
        ))}
      </div>
    </div>
  );
}
