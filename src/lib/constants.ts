// String-union "enums" used across the app. These map to plain String
// columns in prisma/schema.prisma (SQLite has no native enum type) — see
// the comment at the top of that file.

export const USER_ROLES = ["STUDENT", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const CONTENT_STATUSES = ["VISIBLE", "REMOVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const FLAG_TYPES = ["REVIEW", "COMMENT"] as const;
export type FlagType = (typeof FLAG_TYPES)[number];

export const FLAG_STATUSES = ["PENDING", "RESOLVED", "DISMISSED"] as const;
export type FlagStatus = (typeof FLAG_STATUSES)[number];

export const RATING_CATEGORIES = [
  "clarity",
  "fairness",
  "workload",
  "approachability",
] as const;
export type RatingCategory = (typeof RATING_CATEGORIES)[number];

export const RATING_CATEGORY_LABELS: Record<RatingCategory, string> = {
  clarity: "Clarity",
  fairness: "Fairness",
  workload: "Workload",
  approachability: "Approachability",
};

export const RATING_CATEGORY_HELP: Record<RatingCategory, string> = {
  clarity: "Explains material in a way that's easy to follow",
  fairness: "Grades and treats students consistently and fairly",
  workload: "Homework and assessment load relative to the course",
  approachability: "Easy to ask questions of, in and out of class",
};

export const MIN_REVIEW_COMMENT_LENGTH = 40;
export const MAX_REVIEW_COMMENT_LENGTH = 2000;
export const MIN_COMMENT_LENGTH = 2;
export const MAX_COMMENT_LENGTH = 1000;

// Minimum number of reviews a teacher needs before they're eligible for the
// leaderboard, so a single review can't put someone at #1 or #27.
export const LEADERBOARD_MIN_REVIEWS = 3;

// Groups the free-text `Teacher.department` values into student-relevant
// categories for filter UIs. Any department not listed here (e.g. a newly
// added teacher with a title we haven't categorized yet) falls into an
// "Other" bucket rather than breaking the filter.
export const DEPARTMENT_GROUPS = [
  {
    name: "Academics",
    departments: [
      "A Cappella Music",
      "Biology",
      "Biology / Chemistry",
      "Chemistry",
      "Dance / History",
      "Economics / Innovation (The Minchin Center)",
      "Engineering",
      "English",
      "Film / Photography",
      "History",
      "History / Theology",
      "Latin / Theology",
      "Mathematics",
      "Philosophy / Theology / Psychology",
      "Spanish",
      "Spanish / Soccer",
      "Visual Arts",
    ],
  },
  {
    name: "Athletics",
    departments: [
      "Associate Director of Athletics",
      "Associate Head of School for Athletics and Student Life",
      "Athletics",
    ],
  },
  {
    name: "Student Life & Counseling",
    departments: [
      "Academic & College Counselor",
      "Academic Counselor",
      "Associate Head of School for Student Affairs",
      "Chapel Director",
      "Director of Academic Counseling",
      "Director of College Counseling",
      "Director of Student Life",
    ],
  },
  {
    name: "Admissions & Marketing",
    departments: [
      "Admissions Associate",
      "Assistant Director of Admissions",
      "Assistant Director of Marketing - Content & Engagement",
      "Assistant Director of Marketing - Digital Strategy & Analytics",
      "Director of Admissions",
    ],
  },
  {
    name: "Operations & Administration",
    departments: [
      "Administrative Services Coordinator",
      "Director of Business Operations",
      "Director of Facilities",
      "Director of Finance",
      "Director of Security",
      "Director of Technology",
      "Facility Coordinator",
      "Registrar & Academic Resource Librarian",
    ],
  },
  {
    name: "Leadership",
    departments: [
      "Director of Academic Strategy and Operations",
      "Director of Faculty and Academics",
      "Director of PACARTS",
      "Director, Center for Philosophy & Theology",
      "Head of School",
    ],
  },
] as const;

export const OTHER_DEPARTMENT_GROUP = "Other";

export function groupDepartments(
  departments: string[]
): { group: string; departments: string[] }[] {
  const remaining = new Set(departments);
  const groups: { group: string; departments: string[] }[] = [];

  for (const { name, departments: known } of DEPARTMENT_GROUPS) {
    const matched = known.filter((d) => remaining.has(d));
    if (matched.length > 0) {
      groups.push({ group: name, departments: matched });
      matched.forEach((d) => remaining.delete(d));
    }
  }

  if (remaining.size > 0) {
    groups.push({
      group: OTHER_DEPARTMENT_GROUP,
      departments: [...remaining].sort(),
    });
  }

  return groups;
}
