"use client";

import { useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "@/lib/format";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const SEEN_KEY = "seawolves:lastSeenAnnouncementAt";

export function AnnouncementBell({ announcements }: { announcements: AnnouncementItem[] }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const latest = announcements[0]?.createdAt;

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
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current">
          <path
            d="M5 8a5 5 0 0110 0c0 4 1.5 5 1.5 5h-13S5 12 5 8z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8.5 15.5a1.5 1.5 0 003 0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {unread && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-navy" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-gray-200 bg-white py-1 text-sm text-gray-700 shadow-lg sm:w-80">
          <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Announcements 📣
          </div>
          <div className="max-h-80 overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-gray-400">Nothing yet — quiet out here.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="border-b border-gray-50 px-3 py-2.5 last:border-0">
                  <p className="font-medium text-gray-900">{a.title}</p>
                  <p className="mt-0.5 whitespace-pre-line text-xs text-gray-600">{a.body}</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {formatRelativeTime(new Date(a.createdAt))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
