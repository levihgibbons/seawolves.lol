import { type RatingCategory } from "@/lib/constants";
import { ReviewCard, type ReviewCardData } from "./ReviewCard";
import { CommentItem, type CommentNode } from "./CommentThread";
import { EmptyState } from "./ui";
import { ChatIcon } from "./icons";

// A single merged, chronologically-sortable feed of reviews and comments —
// replaces what used to be two separate sections ("Reviews" with star
// ratings, and a separate "Discussion" comment thread). Posting is still
// two shapes under the hood (Review vs. Comment, see DiscussionComposer),
// but reading is one list.
export type DiscussionItem =
  | { type: "review"; createdAt: string; score: number; data: ReviewCardData }
  | { type: "comment"; createdAt: string; score: number; data: CommentNode };

export function DiscussionFeed({
  items,
  teacherId,
  teacherName,
  categories,
  isSignedIn,
  canPost,
}: {
  items: DiscussionItem[];
  teacherId: string;
  teacherName: string;
  categories: readonly RatingCategory[];
  isSignedIn: boolean;
  canPost: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState icon={<ChatIcon className="h-6 w-6" />} title="Nobody's said anything yet" />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={`${item.type}-${item.data.id}`}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
        >
          {item.type === "review" ? (
            <ReviewCard
              review={item.data}
              teacherId={teacherId}
              teacherName={teacherName}
              isSignedIn={isSignedIn}
              categories={categories}
            />
          ) : (
            <CommentItem
              comment={item.data}
              teacherId={teacherId}
              isSignedIn={isSignedIn}
              canPost={canPost}
            />
          )}
        </div>
      ))}
    </div>
  );
}
