import Link from "next/link";
import { Avatar } from "./Avatar";
import { StarRatingDisplay } from "./StarRating";
import { Card } from "./ui";

export function TeacherCard({
  teacher,
}: {
  teacher: {
    id: string;
    name: string;
    department: string;
    photoUrl: string | null;
    overall: number | null;
    reviewCount: number;
  };
}) {
  return (
    <Link href={`/teachers/${teacher.id}`}>
      <Card className="flex h-full flex-col gap-2 p-3 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center gap-2.5">
          <Avatar name={teacher.name} photoUrl={teacher.photoUrl} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{teacher.name}</p>
            <p className="truncate text-xs text-gray-500">{teacher.department}</p>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2">
          <StarRatingDisplay value={teacher.overall} size="sm" />
          <span className="text-xs text-gray-500">
            {teacher.reviewCount} review{teacher.reviewCount === 1 ? "" : "s"}
          </span>
        </div>
      </Card>
    </Link>
  );
}
