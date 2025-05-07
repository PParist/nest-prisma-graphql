/*
  Warnings:

  - Changed the type of `version` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `user_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- แก้ไขสำหรับ permissions
ALTER TABLE "permissions" ADD COLUMN "version_new" INTEGER;
UPDATE "permissions" SET "version_new" = CAST(replace("version", '.', '') AS INTEGER);
ALTER TABLE "permissions" DROP COLUMN "version";
ALTER TABLE "permissions" RENAME COLUMN "version_new" TO "version";
ALTER TABLE "permissions" ALTER COLUMN "version" SET NOT NULL;

-- แก้ไขสำหรับ role_permissions
ALTER TABLE "role_permissions" ADD COLUMN "version_new" INTEGER;
UPDATE "role_permissions" SET "version_new" = CAST(replace("version", '.', '') AS INTEGER);
ALTER TABLE "role_permissions" DROP COLUMN "version";
ALTER TABLE "role_permissions" RENAME COLUMN "version_new" TO "version";
ALTER TABLE "role_permissions" ALTER COLUMN "version" SET NOT NULL;

-- แก้ไขสำหรับ roles
ALTER TABLE "roles" ADD COLUMN "version_new" INTEGER;
UPDATE "roles" SET "version_new" = CAST(replace("version", '.', '') AS INTEGER);
ALTER TABLE "roles" DROP COLUMN "version";
ALTER TABLE "roles" RENAME COLUMN "version_new" TO "version";
ALTER TABLE "roles" ALTER COLUMN "version" SET NOT NULL;

-- แก้ไขสำหรับ user_accounts
ALTER TABLE "user_accounts" ADD COLUMN "version_new" INTEGER;
UPDATE "user_accounts" SET "version_new" = CAST(replace("version", '.', '') AS INTEGER);
ALTER TABLE "user_accounts" DROP COLUMN "version";
ALTER TABLE "user_accounts" RENAME COLUMN "version_new" TO "version";
ALTER TABLE "user_accounts" ALTER COLUMN "version" SET NOT NULL;
ALTER TABLE "user_accounts" ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "permissions_uuid_idx" ON "permissions"("uuid");

-- CreateIndex
CREATE INDEX "roles_uuid_idx" ON "roles"("uuid");

-- CreateIndex
CREATE INDEX "user_accounts_uuid_idx" ON "user_accounts"("uuid");

-- CreateIndex
CREATE INDEX "user_accounts_email_idx" ON "user_accounts"("email");

-- CreateIndex
CREATE INDEX "user_accounts_role_uuid_idx" ON "user_accounts"("role_uuid");
