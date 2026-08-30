// One source of truth for the primary navigation — used by the header, the
// mobile menu and the footer so they can't drift apart.
export const NAV_LINKS = [
  { href: "/teachers", label: "Roster" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/the-fallen", label: "The Fallen" },
  { href: "/announcements", label: "Announcements" },
] as const;
