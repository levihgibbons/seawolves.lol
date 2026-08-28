# seawolves.lol

A teacher-review platform for Pacifica Christian High School — Next.js (App Router) +
TypeScript + Tailwind, Prisma + Supabase Postgres, NextAuth v5 (email+password and Google).

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
2. **Outbound email.** Set `RESEND_API_KEY` and `EMAIL_FROM` (see "Email (Resend)"
   below) — without them, verification and reset links are logged to the server
   console instead of emailed (fine for local dev, not for real users).
3. **Google sign-in.** Set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (see "Google
   sign-in" below) — without them the Google provider will error if someone clicks
   "Continue with Google," so either configure it or hide that button.
4. **Database.** Runs against Supabase Postgres in both dev and production — see
   "Database (Supabase)" below for connection details and the security posture.
5. **`NEXTAUTH_SECRET`.** Generate a real one for production: `openssl rand -base64
   32`. The one in your local `.env` is dev-only.
6. **Admin bootstrap.** `ADMIN_EMAILS` (comma-separated) auto-promotes matching
   accounts to `ADMIN` the moment they verify (Google sign-ins count as verified
   immediately). Set this to whoever should moderate the site before real
   sign-ups start.

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

## Sign-in flow

`/login` is the single entry point for both signing in and creating an
account — there's no separate sign-up page (`/signup` just redirects here).
Enter an email and the server decides what comes next
(`src/app/api/auth/start`):

- **Existing account with a password** → password field.
- **New email** (or an abandoned signup that never finished) → a 6-digit code
  is emailed, entered on the same page, then the account is created and the
  user picks a password (`src/app/api/auth/verify-code` issues a short-lived
  token that's handed to the existing `/api/auth/reset-password` route to
  actually set it — one code path writes `hashedPassword`, whether it's a
  brand new account or an existing user resetting their password).
- **Google-only account** → a screen pointing at the "Continue with Google"
  button instead of a password field they can't use.

## Email (Resend)

`src/lib/mailer.ts` sends verification codes and password-reset emails through
[Resend](https://resend.com). Setup:

1. Create a Resend account, then **Settings > API Keys** for `RESEND_API_KEY`.
2. **Settings > Domains** — add and verify a domain you control (adds a couple of
   DNS records, SPF + DKIM, at wherever that domain's DNS lives — Namecheap, in
   this project's case). `EMAIL_FROM` must be an address on that verified domain,
   e.g. `seawolves.lol <no-reply@seawolves.lol>`.
3. Set both env vars in `.env` (local) and in Vercel's project settings
   (production) — see "Deploying" below.

Leave `RESEND_API_KEY` unset to keep the local-dev fallback: emails get logged to
the server console instead of sent, so you can still develop and test the
verification/reset flow without a Resend account.

## Google sign-in

NextAuth is configured with both a Credentials provider (email/password) and a
Google provider, side by side — a user can sign up either way, and the same
`ALLOWED_EMAIL_DOMAIN` restriction and admin-email logic (`src/lib/auth.ts`)
applies to both. A couple of things are specific to the Google path:

- **No password, until they set one.** Google-only accounts have
  `hashedPassword: null`, so they can't use the Credentials password field on
  `/login` (that email routes to a "this account uses Google sign-in" screen
  instead — see `mode: "google-only"` in `src/app/api/auth/start`). They *can*
  still go through `/forgot-password` to set one later if they want a second
  way in; nothing in that flow depends on a password having existed before.
- **Skips code verification.** Google already proved the person controls that
  inbox, so a Google sign-in sets `emailVerified` immediately, the same way a
  completed Credentials sign-up does.
- **First sign-in creates the account.** There's no separate "register with
  Google" step; signing in with an allowed, not-yet-seen email creates the
  `User` row on the spot.

Setup, in [Google Cloud Console](https://console.cloud.google.com):

1. **APIs & Services > OAuth consent screen** — configure it (External user type
   is fine for a school-facing app; internal only works if everyone is on the
   same Google Workspace).
2. **APIs & Services > Credentials > Create Credentials > OAuth client ID**,
   type **Web application**. Add an **Authorized redirect URI** for every
   environment that needs one:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://www.seawolves.lol/api/auth/callback/google` (production)
3. Copy the generated **Client ID** and **Client Secret** into
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — locally in `.env`, in
   production via Vercel's project settings.

Without these set, the Credentials form still works; only the "Continue with
Google" button errors if clicked.

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

- **Email verification happens before an account exists, not after.** `/login`
  is a single email-first flow (`src/app/api/auth/start`): a new email gets a
  6-digit code, and only after that code is confirmed does the account get
  created and the user choose a password (`src/app/api/auth/verify-code` hands
  back a short-lived token, reusing the same `resetToken` mechanism as
  "forgot password" to actually set it). An existing email goes straight to a
  password prompt. This means every account — Credentials or Google — is
  always verified from the moment it exists; there's no unverified-but-usable
  limbo state or a separate "resend verification" step to build.
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
