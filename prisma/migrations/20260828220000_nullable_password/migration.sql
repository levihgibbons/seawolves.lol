-- Google-authenticated accounts have no password to hash — only
-- Credentials-provider accounts do.
ALTER TABLE "User" ALTER COLUMN "hashedPassword" DROP NOT NULL;
