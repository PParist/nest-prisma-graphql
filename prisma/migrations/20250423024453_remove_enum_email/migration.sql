/*
  Warnings:

  - The values [EMAIL] on the enum `LoginType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LoginType_new" AS ENUM ('NONE', 'GOOGLE', 'FACEBOOK', 'APPLE', 'HUAWEI', 'GUEST');
ALTER TABLE "user_accounts" ALTER COLUMN "login_type" TYPE "LoginType_new" USING ("login_type"::text::"LoginType_new");
ALTER TYPE "LoginType" RENAME TO "LoginType_old";
ALTER TYPE "LoginType_new" RENAME TO "LoginType";
DROP TYPE "LoginType_old";
COMMIT;
