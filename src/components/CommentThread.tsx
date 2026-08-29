"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatRelativeTime } from "@/lib/format";
import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/lib/constants";
import { FlagButton } from "./FlagButton";
import { HelpfulButton } from "./HelpfulButton";
import { Button, Textarea, ErrorText, Badge } from "./ui";

// Beyond this many nested levels, replies stop adding visual indent (see
// CommentItem) — still threaded, just flat past this point.
const MAX_INDENT_DEPTH = 4;

export type CommentNode = {
  id: string;
  createdAt: string;
  body: string;
  isOwn: boolean;
  username: string | null;
  helpfulCount: number;
  viewerHasVoted: boolean;
  replies: CommentNode[];
};

export function CommentComposer({
  teacherId,
  parentId,
  onDone,
  autoFocus,
  placeholder,
}: {
  teacherId: string;
  parentId?: string;
  onDone?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (body.trim().length < MIN_COMMENT_LENGTH) {
      setError("Comment is too short.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, parentId: parentId ?? null, body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setBody("");
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <Textarea
        autoFocus={autoFocus}
        rows={parentId ? 2 : 3}
        maxLength={MAX_COMMENT_LENGTH}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? "Ask a question or leave a quick note for other students..."}
      />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="text-xs">
          {parentId ? "Reply" : "Post comment"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} className="text-xs">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function CommentItem({
  comment,
  teacherId,
  isSignedIn,
  canPost,
  depth = 0,
}: {
  comment: CommentNode;
  teacherId: string;
  isSignedIn: boolean;
  // Eligible to post (signed in, verified, has a username) AND the teacher
  // is still active — see canPost in the teacher page. Controls whether
  // Reply is offered at all; needsUsername/closed/signed-out messaging is
  // shown once, above the whole discussion, rather than per comment.
  canPost: boolean;
  depth?: number;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);

  // Replies can nest arbitrarily deep, but each level's pl-4 indent
  // compounds visually (nested boxes, not a flat depth * offset) — stop
  // adding indent past MAX_INDENT_DEPTH so a long thread can't push
  // content off a narrow screen. Still fully nested/threaded past that
  // depth, just without further indent.
  const indented = depth > 0 && depth <= MAX_INDENT_DEPTH;

  return (
    <div
      className={
        depth === 0
          ? "border-b border-gray-200 py-4 last:border-0"
          : indented
            ? "mt-3 border-l-2 border-gray-100 pl-4"
            : "mt-3"
      }
    >
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{comment.username ?? "Seawolf"}</span>
        <span>·</span>
        <span>{formatRelativeTime(new Date(comment.createdAt))}</span>
        {comment.isOwn && <Badge tone="navy">You</Badge>}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-gray-800">{comment.body}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <HelpfulButton
          endpoint={`/api/comments/${comment.id}/helpful`}
          label="Like"
          initialCount={comment.helpfulCount}
          initialVoted={comment.viewerHasVoted}
          isSignedIn={isSignedIn}
        />
        {canPost && (
          <button
            type="button"
            onClick={() => setReplying((r) => !r)}
            className="text-xs font-medium text-gray-500 hover:text-navy"
          >
            Reply
          </button>
        )}
        {comment.isOwn ? (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete this comment?")) return;
              const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
              if (res.ok) router.refresh();
            }}
            className="text-xs font-medium text-gray-500 hover:text-red-600"
          >
            Delete
          </button>
        ) : (
          <FlagButton endpoint={`/api/comments/${comment.id}/flag`} isSignedIn={isSignedIn} />
        )}
      </div>

      {replying && (
        <div className="mt-2">
          <CommentComposer
            teacherId={teacherId}
            parentId={comment.id}
            autoFocus
            placeholder="Write a reply..."
            onDone={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          teacherId={teacherId}
          isSignedIn={isSignedIn}
          canPost={canPost}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
