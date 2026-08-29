-- Lets a user change their own username from /account, gated to once every
-- 30 days (see src/lib/username.ts usernameChangeAvailableAt). Null until
-- the first change.
ALTER TABLE "User" ADD COLUMN "usernameChangedAt" TIMESTAMP(3);
