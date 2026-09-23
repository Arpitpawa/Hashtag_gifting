-- Email / phone verification + "sign out everywhere after password change".
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt"      TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailVerifyToken"     TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerifyExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "phoneVerifiedAt"      TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "passwordChangedAt"    TIMESTAMP(3);

-- Accounts that already exist (admin, test users, Google sign-ins) are treated
-- as verified so nobody is locked out when verification is switched on.
UPDATE "User" SET "emailVerifiedAt" = NOW() WHERE "email" IS NOT NULL;
UPDATE "User" SET "phoneVerifiedAt" = NOW() WHERE "phone" IS NOT NULL AND "email" IS NULL;
