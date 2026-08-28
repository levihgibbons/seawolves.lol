-- Lock down Supabase's auto-generated REST/GraphQL API (PostgREST).
--
-- This app never uses that API — it talks to Postgres only through this
-- Prisma connection, authenticated as the `postgres` role, which owns
-- every table below and therefore bypasses Row Level Security regardless
-- of what's enabled here. But Supabase exposes every table in the
-- `public` schema through PostgREST by default, readable/writable by
-- anyone holding the project's public `anon` key (which is meant to be
-- public — it ships in client-side bundles) unless RLS says otherwise.
-- Without this migration, the entire dataset — including
-- `hashedPassword`, verification/reset tokens, and moderation flags —
-- would be exposed to an unauthenticated caller of that API, even though
-- the app was never built to use it.
--
-- Enabling RLS with zero policies makes every table default-deny for any
-- role that isn't the table owner (i.e. `anon` and `authenticated`, the
-- roles PostgREST runs as). No policies are added because nothing should
-- be reachable through that path — if a future feature needs the
-- Supabase client SDK talking to Postgres directly, add narrowly-scoped
-- policies then, rather than opening this back up wholesale.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HelpfulVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Flag" ENABLE ROW LEVEL SECURITY;
