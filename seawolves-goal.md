# seawolves.lol — Teacher Review Platform for Pacifica Christian High School

## Execution instructions
Build this entire project end-to-end in one continuous session. Do NOT stop
to confirm the schema, design direction, or scope with me partway through —
make reasonable decisions yourself at each step (using the defaults and
priorities below to resolve any ambiguity) and keep going until the full
app described below is built, seeded, and runnable. Only stop early if you
hit a hard blocker (e.g. a missing credential you cannot proceed without).

## Overview
Build "seawolves.lol," a professional teacher-review web app for Pacifica
Christian High School (Santa Monica, CA), modeled functionally on
RateMyProfessors.com. This is an approved school project with sign-off from
the Head of School and consent from listed faculty — not an anonymous attack
site. Prioritize trust, moderation, and a clean/professional feel over flashy
design. Explicitly avoid a "vibe-coded" look: no gradient-heavy hero sections,
no emoji-as-icons, no generic Bootstrap-card defaults. Aim for something that
looks like a real, deployed product a school could officially endorse.

## Brand
- Primary color: Pacifica navy blue #003260
- Secondary: white, with a light steel-blue accent (~#4A7FA7) for hover
  states / secondary buttons
- Mascot: Seawolves — subtle nautical/wolf accents are fine (e.g. a wave
  divider, a wolf-track favicon) but keep it restrained, not cartoonish
- Typography: one clean sans-serif (e.g. Inter) for a professional academic feel
- Reference school site for tone: https://www.pacificachristian.org

## Teacher data (seed data)
Seed the database with this faculty roster (name — subject). Only these
teaching-staff members are ratable — do NOT include admissions, facilities,
or executive/admin staff:

- Tehillah Alphonso — A Cappella Music
- Sam Anderson — Film / Photography
- Ruth Andrew — English
- Matt Benedetto — Mathematics
- Scott Comer — History / Theology
- Violet Comer — Dance / History
- Amber DeBenning — English
- Steven Eno — Mathematics
- Nicole Geiger — Biology
- Karla Herrera — Spanish
- Clarita Joung — Chemistry
- Devin Ketch — Philosophy / Theology / Psychology
- Joo Bin Kim — History
- Chris McCulloch — History / Theology
- Darryle Mensah — Mathematics
- Dr. Katheryn Park — English
- Katie Savage — English
- Linnea Scobey — Latin / Theology
- Nic Scobey — Biology / Chemistry
- Dr. David Sumida — Engineering
- Ryan Tahbaz — Spanish / Soccer
- Jeremy Tuggy — Mathematics
- Isaias Uggetti — English
- Carson Vandermade — Visual Arts
- Zemeira Walker — Visual Arts
- Michael Weaver — History / Theology
- Josephine Wilson — Mathematics

Structure this as a seed script (JSON or TS array feeding a DB seed) so an
admin can add/remove/edit teachers later without a redeploy — the roster
changes yearly.

## Core features

### 1. Authentication
- Email/password sign-up, restricted to a school email domain — read the
  allowed domain from an env var (e.g. `ALLOWED_EMAIL_DOMAIN`) with a
  sensible placeholder default, since you don't have the real domain;
  document this clearly in the README as something that needs to be set
  before launch
- Email verification required before posting (if no email service is wired
  up, stub it — log the verification link to console/dev output — and note
  in the README that a real provider like Resend/Postmark needs to be
  connected for production)
- Password reset flow
- Store only hashed passwords (bcrypt/argon2)

### 2. Teacher profiles
- One page per teacher: name, subject/department, photo (placeholder avatar
  until real photos are added), overall average rating, rating breakdown by
  category, all reviews
- Rating categories (1–5 stars each): Clarity, Fairness, Workload,
  Approachability
- Computed overall score = average of category scores

### 3. Reviews
- A review = star ratings across the 4 categories + a written comment
  (enforce a minimum length, e.g. 40 characters, to discourage low-effort
  spam like "worst teacher")
- One review per user per teacher (editable/deletable by the author, not
  resubmittable as a duplicate)
- Reviews are anonymous to other users but tied to the account internally
  for moderation purposes
- Upvote/"helpful" button on reviews, sort by Most Helpful / Most Recent

### 4. Comments/discussion
- Allow threaded comments on a teacher's page separate from formal reviews
  (lighter-weight, e.g. shoutouts, questions like "does he curve exams")
- Same auth + moderation rules apply

### 5. All-time leaderboard
- A dedicated leaderboard page ranking teachers by average overall rating
  (minimum review count threshold, e.g. 3+ reviews, to avoid one review
  skewing rank)
- Filters: by department, by rating category, most-reviewed
- Include a "most reviewed this month" secondary view

### 6. Moderation (required, not optional)
- A report/flag button on every review and comment
- An admin dashboard (role-gated) to view flagged content, remove it, and
  ban/suspend abusive accounts
- Basic profanity/slur filter that blocks submission client- and server-side
  before it even hits the DB
- Server-side rule: reject/flag reviews containing personal-life claims
  outside teaching (best-effort keyword/pattern flagging + human review
  queue, not perfect automated detection)
- Terms of Service / community guidelines page, written in plain language,
  explicitly stating reviews must relate to teaching quality only —
  no accusations, no personal attacks, no comments on appearance
- Standard disclaimer footer: "Reviews reflect the opinions of individual
  students, not verified facts or the position of Pacifica Christian
  High School."

### 7. Admin tools
- Add/edit/remove teachers
- Manage flagged content queue
- View basic analytics (review volume, most active reviewers by count only,
  not exposing who-reviewed-who beyond what's needed for abuse handling)

## Tech stack
Next.js (App Router) + TypeScript + Tailwind for frontend, Postgres (via
Prisma) for the DB, NextAuth for sign-up/login. Make it deployable to
Vercel + a managed Postgres (e.g. Neon/Supabase) — use SQLite locally for
zero-config dev if that's faster to get running, but keep the schema
Postgres-compatible.

## Design direction
- Clean, editorial, "official-feeling" — think a real SaaS product or a
  university course-review tool, not a hackathon side project
- Avoid: purple/pink gradients, glassmorphism overload, emoji as UI icons,
  playful/rounded display fonts, excessive animation
- Do: generous whitespace, a real header/nav, consistent card design,
  subtle shadows, navy (#003260) used purposefully (nav bar, buttons,
  headers) against a white/light-gray base
- Homepage: search/browse teachers, leaderboard preview, a short "how it
  works" section, and a clear link to community guidelines

## Build order (execute all steps without pausing for input)
1. Scaffold project + DB schema (users, teachers, reviews, comments, flags)
2. Seed teacher data from the roster above
3. Auth flow (sign up / verify / login / reset)
4. Teacher profile pages + review submission
5. Leaderboard page
6. Comments feature
7. Moderation/report flow + admin dashboard
8. Design polish pass against the "do not look vibecoded" bar above
9. Write a README covering: env vars to set before launch (email domain,
   email provider, DB connection, NEXTAUTH_SECRET), how to run locally,
   and how to deploy

When finished, give a summary of what's built, what's stubbed (e.g. email
sending) and needs a real provider before going live, and any decisions
made where the spec was ambiguous.
