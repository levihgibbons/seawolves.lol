-- Display identity for reviews/comments. Nullable because existing
-- accounts (and every Google-authenticated account, which never went
-- through a form) don't have one yet; the app gates further access until
-- one is chosen (see src/proxy.ts).
ALTER TABLE "User" ADD COLUMN "username" TEXT;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
