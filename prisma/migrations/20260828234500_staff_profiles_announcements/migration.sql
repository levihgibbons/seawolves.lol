-- Staff/faculty distinction, user profile fields, and announcements.
--
-- 1. Teacher.isFaculty distinguishes classroom faculty from administrative
--    /support staff so the app can hide the "workload" (homework) rating
--    category for people who don't assign homework. Defaults to true so
--    existing rows (all currently-seeded classroom teachers plus staff)
--    stay visible/unchanged until backfilled below.
ALTER TABLE "Teacher" ADD COLUMN "isFaculty" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: everyone seeded from the school's Executive Team, Administration,
-- and Counseling & Support Staff directory sections (see prisma/teachers.ts)
-- is staff, not classroom faculty. Matched by name since there's no other
-- stable identifier at seed time.
UPDATE "Teacher" SET "isFaculty" = false WHERE "name" IN (
  'Jim Knight', 'Wally Hirsch', 'Brandon Shaw', 'Carly Barforth', 'Kelly Gendall',
  'Nichole KnottCraig', 'Hilary Miller', 'Dr. Mary Ortiz',
  'Shelby Benjamin', 'Danny Caldera', 'Dane Fragger', 'Albert Kong', 'Staci Lane',
  'Bethany Mudd', 'Mathew Mulligan', 'Nate Overby', 'Stephen Roberson',
  'Essy Anavim', 'Julio Cesar Hernandez', 'Trevor DeBenning', 'Melanie Hughes',
  'Kelly Kurtenbach', 'Rachel Moore', 'Emily Risley', 'Jack Weill',
  'Christian Winter', 'Bethany Wiseblood', 'Mercedes Worman'
);

-- 2. Review.workload becomes optional: reviews of non-faculty staff don't
--    collect a workload rating at all (nothing to backfill — Review is
--    empty in production as of this migration).
ALTER TABLE "Review" ALTER COLUMN "workload" DROP NOT NULL;

-- 3. Public user profile fields (seawolves.lol/<username>).
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "image" TEXT;

-- 4. Announcements, surfaced via the bell icon in the header.
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Same default-deny RLS posture as every other table — see
-- 20260828190000_enable_rls's comment for why this matters even though the
-- app only ever talks to Postgres through Prisma.
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
