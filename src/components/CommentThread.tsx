"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatRelativeTime } from "@/lib/format";
import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/lib/constants";
import { FlagButton } from "./FlagButton";
import { Button, Textarea, ErrorText, Badge } from "./ui";

export type CommentNode = {
  id: string;
  createdAt: string;
  body: string;
  isOwn: boolean;
  replies: CommentNode[];
};

function CommentComposer({
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

function CommentItem({
  comment,
  teacherId,
  isSignedIn,
  depth = 0,
}: {
  comment: CommentNode;
  teacherId: string;
  isSignedIn: boolean;
  depth?: number;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);

  return (
    <div className={depth > 0 ? "mt-3 border-l-2 border-gray-100 pl-4" : "border-b border-gray-200 py-4 last:border-0"}>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Seawolf</span>
        <span>·</span>
        <span>{formatRelativeTime(new Date(comment.createdAt))}</span>
        {comment.isOwn && <Badge tone="navy">You</Badge>}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-gray-800">{comment.body}</p>
      <div className="mt-1.5 flex items-center gap-3">
        {depth === 0 && (
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
        <CommentItem key={reply.id} comment={reply} teacherId={teacherId} isSignedIn={isSignedIn} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CommentThread({
  teacherId,
  comments,
  isSignedIn,
}: {
  teacherId: string;
  comments: CommentNode[];
  isSignedIn: boolean;
}) {
  return (
    <div>
      {isSignedIn ? (
        <CommentComposer teacherId={teacherId} />
      ) : (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          <a href="/login" className="font-medium text-navy hover:underline">
            Sign in
          </a>{" "}
          to join the discussion.
        </p>
      )}

      <div className="mt-4">
        {comments.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">No comments yet. Ask the first question.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} teacherId={teacherId} isSignedIn={isSignedIn} />
          ))
        )}
      </div>
    </div>
  );
}
