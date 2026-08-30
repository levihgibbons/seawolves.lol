import Link from "next/link";
import { Avatar } from "./Avatar";
import { StarRatingDisplay } from "./StarRating";
import { Badge, cx } from "./ui";
import { teacherRoleLabel } from "@/lib/constants";
import { ChatIcon } from "./icons";

export function TeacherCard({
  teacher,
  muted = false,
}: {
  teacher: {
    id: string;
    name: string;
    department: string;
    isFaculty?: boolean;
    photoUrl: string | null;
    overall: number | null;
    reviewCount: number;
  };
  // The Fallen renders the same card desaturated until you hover it.
  muted?: boolean;
}) {
  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className={cx(
"group relative flex h-full flex-col overflow-hidden rounded-card border border-navy-100/80 bg-white p-4 shadow-soft transition duration-300 ease-smooth hover:-translate-y-1 hover:border-surf-200 hover:shadow-lift motion-reduce:hover:translate-y-0",
        muted && "opacity-80 grayscale hover:opacity-100 hover:grayscale-0"
      )}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-surf-100 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
        aria-hidden
      />

      {/* The name gets the full card width — the score lives in the footer so
          longer names don't truncate after eight characters. */}
      <div className="relative flex items-start gap-3">
        <Avatar
          name={teacher.name}
          photoUrl={teacher.photoUrl}
          className="transition-transform duration-300 ease-out-back group-hover:scale-105"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[0.95rem] font-extrabold leading-tight tracking-tight text-navy-900">
            {teacher.name}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-navy-500">{teacher.department}</p>
          <Badge tone="neutral" className="mt-1.5">
            {teacherRoleLabel(teacher.department, teacher.isFaculty ?? true)}
          </Badge>
        </div>
      </div>

      {/* mt-auto pins the footer to the card bottom so a grid row of cards
          lines up even when some carry a Staff badge and others don't. */}
      <div className="relative mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 border-t border-navy-50 pt-3">
          {teacher.reviewCount === 0 ? (
            // A grid of 57 cards each reading "New" next to "0" was just noise.
            // One quiet line says the same thing once.
            <span className="text-xs font-semibold text-navy-500">Not rated yet</span>
          ) : (
            <>
              <StarRatingDisplay value={teacher.overall} size="sm" />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-400">
                <ChatIcon className="h-3.5 w-3.5" />
                {teacher.reviewCount}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
