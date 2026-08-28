# RateMySeawolf

A teacher-review platform for Pacifica Christian High School — Next.js (App Router) +
TypeScript + Tailwind, Prisma + Supabase Postgres, NextAuth v5 (Credentials/email+password).

This is an approved school project, not an anonymous attack site: reviews are tied
internally to a verified account and moderated (profanity filter, personal-life-content
filter, report queue — see "How moderation works" below). Sign-up is currently open to
any email address — see #1 below to restrict it to a school domain.

## Before you launch — required setup

These are stubbed or defaulted for local development. **Do not go live without
addressing them:**

1. **School email domain (optional).** Sign-up is open to any email by default.
   `ALLOWED_EMAIL_DOMAIN` in `.env` is empty; set it to a real domain
   (e.g. `pacificachristian.org`) if you want to restrict registration to school
   accounts. Leave it empty to keep sign-up open.
2. **Outbound email.** No email provider is wired up. Verification links and
   password-reset links are logged to the server console instead of emailed (see
   `src/lib/mailer.ts`). Before launch, implement `deliver()` there using a real
   provider (Resend, Postmark, SES, ...) — every call site (`sendVerificationEmail`,
   `sendPasswordResetEmail`) stays the same.
3. **Database.** Runs against Supabase Postgres in both dev and production — see
   "Database (Supabase)" below for connection details and the security posture.
4. **`NEXTAUTH_SECRET`.** Generate a real one for production: `openssl rand -base64
   32`. The one in your local `.env` is dev-only.
5. **Admin bootstrap.** `ADMIN_EMAILS` (comma-separated) auto-promotes matching
   accounts to `ADMIN` the moment they verify. Set this to whoever should moderate
   the site before real sign-ups start.

See `.env.example` for the full list with inline comments.

## Running locally

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL/DIRECT_URL from your Supabase project,
                           # then edit ALLOWED_EMAIL_DOMAIN / ADMIN_EMAILS as needed
npm run db:migrate        # applies the schema to your Supabase database
npm run db:seed           # seeds the 57-person roster + demo accounts
npm run dev
```

Open http://localhost:3000.

## Database (Supabase)

The app talks to Postgres only through this Prisma connection — never through
Supabase's client-side SDK or its auto-generated REST/GraphQL API (PostgREST).
That matters for two reasons:

- **Connection strings.** A Supabase project's *direct* connection
  (`db.<ref>.supabase.co`) is IPv6-only, which many networks and CI runners
  can't reach. Use the pooler (Supavisor) instead: `DATABASE_URL` is the
  Transaction pooler (port 6543, `pgbouncer=true`) for the app's runtime
  connection, and `DIRECT_URL` is the Session pooler (port 5432, no
  `pgbouncer` param) for `prisma migrate`, which needs session-level features
  the transaction pooler doesn't support. Both are IPv4-compatible. Get the
  exact values from Project Settings → Database → Connection string in your
  Supabase dashboard.
- **Row Level Security is enabled on every table**, with no policies
  (migrations `20260828190000_enable_rls` and the RLS statement in
  `20260828191500_fk_indexes_and_rls_fix`). Supabase exposes every table in
  the `public` schema through PostgREST by default — readable/writable by
  anyone holding the project's public anon/publishable key — regardless of
  whether the app was built to use that API. RLS with no policies makes
  every table default-deny for the `anon`/`authenticated` roles PostgREST
  runs as, while this app's own connection (the `postgres` role, which owns
  the tables) is unaffected, since table owners bypass RLS. If a future
  feature needs the Supabase client SDK talking to Postgres directly, add
  narrowly-scoped policies then — don't disable RLS wholesale.

Run `supabase db advisors` (or the MCP `get_advisors` tool) after any schema
change to catch regressions in either area.

### Demo accounts (seeded, password for all: `Password123!`)

| Role  | Email                                        |
|-------|-----------------------------------------------|
| Admin | `admin@<ALLOWED_EMAIL_DOMAIN>`                |
| Student | `student@<ALLOWED_EMAIL_DOMAIN>`            |
| Student | `student2@<ALLOWED_EMAIL_DOMAIN>`           |

With the default `.env`, that's `admin@pacificachristian.example.edu`, etc.

### Useful scripts

- `npm run db:studio` — Prisma Studio, a GUI for the local database.
- `npm run db:seed` — re-run the roster seed (safe to re-run; upserts).
- `npm run lint` / `npx tsc --noEmit` — lint / typecheck.

## Managing the roster

The roster covers everyone ratable on the site: classroom faculty plus the
Executive Team, Administration, and Counseling & Support Staff sections of the
school's public staff directory (admissions, facilities, and other non-teaching
staff are included, not just classroom teachers). The initial roster lives in
`prisma/teachers.ts` and is only used the first time you seed (re-running
`npm run db:seed` upserts name/department/photo for existing rows too — safe to
re-run after editing that file). `department` holds a subject label for
teaching faculty or a job title for everyone else (e.g. "Director of
Admissions") — there's no "subject" for non-teaching roles. Day-to-day, an
admin adds/edits/removes people from `/admin/teachers` — no redeploy needed.
"Removing" someone soft-deletes them (hides from public listings, keeps
historical reviews); it can be undone from the same screen.

### Roster photos

`prisma/teachers.ts` points each seeded person at a headshot in
`public/teachers/`, downloaded from the school's own public staff directory
(pacificachristian.org/about/our-staff) and matched by name — not hotlinked, so
the site doesn't depend on their server at runtime. If someone's official photo
changes, re-download it into `public/teachers/` and update their `photoUrl` in
`prisma/teachers.ts` (or just set it from `/admin/teachers`, which also accepts
any photo URL for people added later). Anyone without a photo falls back to an
initials avatar automatically.

## How moderation works

- Every review and comment can be reported (`Report` button) — goes to a
  human-reviewed queue at `/admin/flags`, not auto-removed.
- A profanity/slur filter (`src/lib/profanity.ts`, built on the `bad-words`
  package) blocks submission client- and server-side before it reaches the DB.
- A best-effort keyword/pattern filter (`src/lib/personalLifeFilter.ts`) flags
  content that looks like a personal-life claim rather than teaching feedback
  (appearance, relationships, unverified accusations, etc.). This does **not**
  block the post — it's flagged for a human moderator in the same `/admin/flags`
  queue, since automated detection isn't reliable enough to auto-delete on.
- Admins can remove content, dismiss a flag, or suspend/ban the account behind it,
  all from the flags queue. `/admin/users` also lists every account for direct
  status changes.

## Deploying

Target: Vercel (app) + Supabase (Postgres, already set up per "Database (Supabase)"
above).

1. Set `DATABASE_URL`/`DIRECT_URL` and the rest of `.env.example` in your host's
   dashboard — especially a real `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your production
   URL), and `ADMIN_EMAILS`. Set `ALLOWED_EMAIL_DOMAIN` too if you want registration
   restricted to a school domain — it's open to any email otherwise.
2. Run `npx prisma migrate deploy` against production if it hasn't seen the latest
   migrations yet (not `migrate dev`).
3. Wire up a real email provider in `src/lib/mailer.ts` before allowing real
   sign-ups — without it, verification and password-reset links only appear in
   server logs, which no one but you can see in production.
4. `npm run build && npm run start`, or let Vercel do it.

## Notable decisions made where the spec was ambiguous

- **Login vs. posting verification.** The spec says "email verification required
  before posting," so sign-in itself only requires an `ACTIVE` account — email
  verification is enforced at the point of posting a review/comment (with a
  "resend verification" action on `/account`), not at login. This lets someone
  browse immediately after signing up.
- **Verification link requires a click, not just a page load.** `/verify` shows a
  confirm button rather than auto-consuming the token on page load, so an email
  security scanner or link-preview bot that fetches the URL can't silently burn a
  one-time link before the real user clicks it.
- **Failed login shows one generic message** ("invalid email or password, or your
  account isn't active") rather than distinguishing "wrong password" from "banned"
  from "unknown email" — so the login form can't be used to enumerate accounts or
  probe account status.
- **Threaded comments are two levels deep** (a top-level comment plus direct
  replies, no reply-to-a-reply) to match the spec's "lightweight" framing without
  building full arbitrary-depth threading.
- **Auto-flagging never blocks a post.** Both the profanity filter and the
  personal-life-content filter run server-side; profanity blocks submission
  outright (it's unambiguous), but the personal-life pattern filter only flags for
  human review, per the spec's "best-effort... not perfect automated detection."
- **Analytics vs. moderation identity.** `/admin` (overview/analytics) shows
  reviewer activity by count only ("Reviewer #1: 3 reviews"), never identity.
  `/admin/flags` (the moderation queue) does show the author's email, since acting
  on abuse requires knowing who to act on — this matches the spec's "not exposing
  who-reviewed-who beyond what's needed for abuse handling."
- **Prisma major version.** Prisma 7/8 changed how datasources are configured
  (driver adapters instead of a plain `url` in `schema.prisma`), which is a bigger,
  less-stable lift for this scope. The project is pinned to Prisma 6.19.x, which
  keeps the classic `datasource { url = env(...) }` config this README describes.
