"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatRelativeTime } from "@/lib/format";
import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/lib/constants";
import { Avatar } from "./Avatar";
import { FlagButton } from "./FlagButton";
import { HelpfulButton } from "./HelpfulButton";
import { Button, Textarea, ErrorText, Badge, cx, META_ACTION } from "./ui";
import { ChatIcon, TrashIcon } from "./icons";

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
      setError("That's a little too short.");
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
    <form onSubmit={submit} className="space-y-2.5">
      <Textarea
        autoFocus={autoFocus}
        rows={parentId ? 2 : 3}
        maxLength={MAX_COMMENT_LENGTH}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? "Ask a question, or drop a quick note for the next class…"}
      />
      <ErrorText>{error}</ErrorText>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={loading || body.trim().length === 0}>
          {loading ? "Posting…" : parentId ? "Reply" : "Post"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
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
  const name = comment.username ?? "Seawolf";

  // Replies can nest arbitrarily deep, but each level's indent compounds —
  // stop adding it past MAX_INDENT_DEPTH so a long thread can't push content
  // off a narrow screen. Still fully threaded past that depth.
  const indented = depth > 0 && depth <= MAX_INDENT_DEPTH;

  const body = (
    <>
      <header className="flex items-start gap-2.5">
        <Avatar name={name} size={depth === 0 ? "sm" : "xs"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {comment.username ? (
              <Link
                href={`/${comment.username}`}
                className="text-sm font-extrabold text-navy-900 transition-colors duration-150 hover:text-surf-600"
              >
                {comment.username}
              </Link>
            ) : (
              <span className="text-sm font-extrabold text-navy-900">{name}</span>
            )}
            <span className="text-xs text-navy-300">
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
            {comment.isOwn && <Badge tone="surf">You</Badge>}
          </div>
          <p className="mt-1.5 whitespace-pre-line text-[0.9rem] leading-relaxed text-navy-700">
            {comment.body}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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
                className={cx(
                  META_ACTION,
                  replying
                    ? "bg-navy-100 text-navy-700"
                    : "text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                )}
              >
                <ChatIcon className="h-3.5 w-3.5" />
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
                className={cx(META_ACTION, "text-navy-300 hover:bg-rose-50 hover:text-rose-600")}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : (
              <FlagButton endpoint={`/api/comments/${comment.id}/flag`} isSignedIn={isSignedIn} />
            )}
          </div>

          {replying && (
            <div className="mt-3 animate-scale-in">
              <CommentComposer
                teacherId={teacherId}
                parentId={comment.id}
                autoFocus
                placeholder="Write a reply…"
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </header>

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
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
      )}
    </>
  );

  if (depth === 0) {
    return (
      <article className="rounded-card border border-navy-100/80 bg-white p-4 shadow-soft transition duration-300 hover:shadow-lift sm:p-5">
        {body}
      </article>
    );
  }

  return (
    <div className={cx(indented && "border-l-2 border-navy-100 pl-3.5 sm:pl-4")}>{body}</div>
  );
}
