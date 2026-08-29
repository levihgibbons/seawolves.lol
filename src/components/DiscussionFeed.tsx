import { type RatingCategory } from "@/lib/constants";
import { ReviewCard, type ReviewCardData } from "./ReviewCard";
import { CommentItem, type CommentNode } from "./CommentThread";

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
      <p className="py-6 text-sm text-gray-500">
        Nothing here yet — be the first to rate or comment on {teacherName}.
      </p>
    );
  }

  return (
    <div>
      {items.map((item) =>
        item.type === "review" ? (
          <ReviewCard
            key={`review-${item.data.id}`}
            review={item.data}
            teacherId={teacherId}
            teacherName={teacherName}
            isSignedIn={isSignedIn}
            categories={categories}
          />
        ) : (
          <CommentItem
            key={`comment-${item.data.id}`}
            comment={item.data}
            teacherId={teacherId}
            isSignedIn={isSignedIn}
            canPost={canPost}
          />
        )
      )}
    </div>
  );
}
