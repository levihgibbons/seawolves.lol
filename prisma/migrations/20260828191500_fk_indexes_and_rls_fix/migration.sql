-- CreateIndex: cover every foreign key column that lacked one (flagged by
-- Supabase's performance advisor — Postgres does not auto-index FK columns
-- the way it does primary/unique keys, so joins and cascade-delete lookups
-- on these would otherwise force a sequential scan as data grows).
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "HelpfulVote_userId_idx" ON "HelpfulVote"("userId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Flag_reviewId_idx" ON "Flag"("reviewId");
CREATE INDEX "Flag_commentId_idx" ON "Flag"("commentId");
CREATE INDEX "Flag_reporterId_idx" ON "Flag"("reporterId");

-- Prisma's own migration-bookkeeping table lives in `public` alongside the
-- app's tables, which means Supabase's PostgREST/GraphQL API exposes it
-- too unless RLS says otherwise (flagged as a critical security lint —
-- "RLS Disabled in Public"). It holds only migration checksums/names, not
-- user data, but there's no reason to leave it reachable: this app's own
-- Prisma connection is the table owner and bypasses RLS regardless, so
-- enabling it here has zero effect on migrations, only on the public API.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
