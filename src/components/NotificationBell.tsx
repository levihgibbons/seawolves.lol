"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "@/lib/format";
import { BellIcon, MegaphoneIcon } from "./icons";
import { cx } from "./ui";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const SEEN_KEY = "seawolves:lastSeenAnnouncementAt";

// Surfaces new site-wide announcements (posted from /announcements itself —
// see AnnouncementsFeed.tsx). The bell is the alert; /announcements is the
// archive.
export function NotificationBell({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const latest = notifications[0]?.createdAt;

  useEffect(() => {
    if (!latest) return;
    // Read localStorage in a callback rather than the effect body itself —
    // it's a subscription to an external (per-browser) source, not
    // state derivable from props/state during render.
    Promise.resolve().then(() => {
      try {
        const seen = localStorage.getItem(SEEN_KEY);
        setUnread(!seen || new Date(latest) > new Date(seen));
      } catch {
        // localStorage unavailable (private mode, etc.) — just show as read.
      }
    });
  }, [latest]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle() {
    setOpen((o) => !o);
    if (!open && latest) {
      setUnread(false);
      try {
        localStorage.setItem(SEEN_KEY, latest);
      } catch {
        // ignore — see comment above
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Announcements"
        aria-expanded={open}
        className={cx(
          "relative flex h-10 w-10 items-center justify-center rounded-full text-white transition duration-200 active:scale-90",
          open ? "bg-white/15" : "hover:bg-white/10"
        )}
      >
        <BellIcon className="h-5 w-5" />
        {unread && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-surf-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-surf-400 ring-2 ring-navy-900" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 origin-top-right animate-drop-in overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-lift sm:w-88">
          <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/60 px-4 py-3">
            <MegaphoneIcon className="h-4 w-4 text-surf-500" />
            <p className="text-sm font-extrabold tracking-tight text-navy-900">Announcements</p>
          </div>
          <div className="max-h-[22rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-navy-400">
                Nothing new right now.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="border-b border-navy-50 px-4 py-3 transition-colors duration-150 last:border-0 hover:bg-navy-50/50"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-bold text-navy-900">{n.title}</p>
                    <span className="shrink-0 text-[0.7rem] font-semibold text-navy-300">
                      {formatRelativeTime(new Date(n.createdAt))}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-navy-500">
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>
          <Link
            href="/announcements"
            onClick={() => setOpen(false)}
            className="block border-t border-navy-100 bg-white px-4 py-2.5 text-center text-xs font-bold text-navy-700 transition hover:bg-navy-50"
          >
            See all
          </Link>
        </div>
      )}
    </div>
  );
}
